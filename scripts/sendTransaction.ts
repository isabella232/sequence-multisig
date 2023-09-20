import { commons, v2 } from '@0xsequence/core'
import { LocalRelayer } from '@0xsequence/relayer'
import { subDigestOf } from '@0xsequence/utils'
import { confirm, input } from '@inquirer/prompts'
import { BigNumber, ethers } from 'ethers'
import ora from 'ora'
import type { Config } from './utils/config'
import { createMultisig } from './utils/multisig'

export const sendTransaction = async (
  config: Config,
  transaction: commons.transaction.Transaction,
) => {
  if (!transaction) {
    throw new Error('No transaction to sign')
  }

  const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl)
  const signers = config.signerPrivateKeys.map(
    key => new ethers.Wallet(key, provider),
  )
  if (!config.relayer) {
    // Use first signer as a relayer as default
    config.relayer = new LocalRelayer(signers[0])
  }

  const wallet = await createMultisig(
    signers,
    config,
    provider,
    config.multisigAddress,
  )
  const nonce = await wallet.fetchNonceOrSpace()
  const transactions = [
    commons.transaction.toSequenceTransaction(wallet.address, transaction)
      .transaction,
  ]
  const digest = commons.transaction.digestOfTransactions(nonce, transactions)
  const subdigest = subDigestOf(wallet.address, config.network.chainId, digest)

  console.log(`Transaction subdigest for signing: ${subdigest}`)

  const subdigestBytes = ethers.utils.arrayify(subdigest)

  // Sign transaction with available signers
  const signatureParts: { address: string; signature: string }[] = []
  for (const signer of signers) {
    const address = await signer.getAddress()
    //TODO Check address in wallet config
    const signature = await signer.signMessage(subdigestBytes)
    console.log('Signature of', address, 'is:', signature)
    signatureParts.push({ address, signature })
  }

  // Request missing signatures
  for (const walletSigner of config.walletConfig.signers) {
    const { address } = walletSigner
    if (!signatureParts.find(({ address: a }) => a === address)) {
      // Request it
      const signature = await input({
        message: `Signature for ${address} (empty if unknown):`,
      })
      if (signature) {
        signatureParts.push({ address, signature })
      }
    }
  }

  // Encode signature parts
  const parts = new Map<string, commons.signature.SignaturePart>()
  signatureParts.forEach(({ address, signature }) => {
    const suffix = ethers.utils.arrayify([2])
    const suffixed = ethers.utils.solidityPack(
      ['bytes', 'bytes'],
      [signature, suffix],
    )
    parts.set(address, { signature: suffixed, isDynamic: false })
  })

  // Get current threshold from config and signatures
  const signerPower = config.walletConfig.signers
    .filter(s => parts.has(s.address))
    .map(s => BigNumber.from(s.weight))
    .reduce((a, b) => a.add(b), BigNumber.from(0))

  if (signerPower.lt(config.walletConfig.threshold)) {
    console.log('Threshold not reached.')
    // Output signatures
    signatureParts.forEach(({ address, signature }) => {
      console.log('Signature of', address, 'is:', signature)
    })
    return
  }

  // Encode for sending
  const signature = v2.coders.signature.encodeSigners(
    wallet.config,
    parts,
    [],
    config.network.chainId,
  ).encoded
  const bundle: commons.transaction.SignedTransactionBundle = {
    intent: {
      id: subdigest,
      wallet: wallet.address,
    },
    chainId: config.network.chainId,
    transactions,
    entrypoint: wallet.address,
    nonce,
    signature,
  }
  const answer = await confirm({
    message: 'Threshold reached! Would you like to send the transaction?',
  })
  if (answer) {
    // Send it
    const spinner = ora('Sending transaction').start()
    const tx = await wallet.sendSignedTransaction(bundle)
    await tx.wait()
    spinner.succeed('Transaction sent')
  } else {
    // Output signatures instead
    signatureParts.forEach(({ address, signature }) => {
      console.log('Signature of', address, 'is:', signature)
    })
  }
}
