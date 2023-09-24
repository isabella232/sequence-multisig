import { commons, v2 } from '@0xsequence/core'
import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { createMultisig } from '../utils/multisig'
import { Input } from './base/Input'
import ErrorText, { StatusTextProps } from './base/StatusText'
import { getTransactionSubdigest } from '../utils/transaction'

export type SendTransactionProps = {
  walletConfig: commons.config.SimpleConfig | null
  transaction: commons.transaction.Transaction | null
  signer: ethers.Signer | null
}

const SendTransaction: React.FC<SendTransactionProps> = ({
  walletConfig,
  transaction,
  signer,
}) => {
  const [signatureInfos, setSignatureInfos] = useState<
    { address: string; signature: string }[]
  >([])
  const [canSend, setCanSend] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<StatusTextProps>()
  const [txHash, setTxHash] = useState<string>()

  useEffect(() => {
    const infos =
      walletConfig?.signers.map(s => {
        return { address: s.address, signature: '' }
      }) ?? []
    setSignatureInfos(infos)
  }, [walletConfig])

  useEffect(() => {
    if (!signer || !walletConfig) {
      setCanSend(false)
      return
    }
    createMultisig([signer], walletConfig).then(async wallet => {
      setStatus(undefined)
      if (!wallet || !(await wallet.reader().isDeployed(wallet.address))) {
        setStatus({ isError: true, text: 'Deploy multisig wallet first' })
        setCanSend(false)
        return
      }

      // Check signature threshold
      const signerPower = signatureInfos
        .filter(info => !!info.signature)
        .map(info => walletConfig.signers.find(s => info.address === s.address))
        .map(s => BigNumber.from(s?.weight ?? 0))
        .reduce((a, b) => a.add(b), BigNumber.from(0))

      if (signerPower.lt(walletConfig.threshold)) {
        setCanSend(false)
        setStatus({ isError: true, text: 'Not enough signatures' })
        return
      }

      setCanSend(true)
    })
  }, [signer, walletConfig, signatureInfos])

  const updateSignature = (address: string, signature: string) => {
    const infos = signatureInfos.map(s => {
      if (s.address === address) {
        return { address, signature }
      }
      return s
    })
    setSignatureInfos(infos)
  }

  const doSendTransaction = async () => {
    if (!signer || !walletConfig) return
    setStatus(undefined)
    setLoading(false)

    try {
      const provider = signer.provider
      const wallet = await createMultisig([signer], walletConfig)
      if (!wallet || !provider || !transaction) throw new Error('Error') // Unreachable

      setLoading(true)

      // Combine signatures
      const parts = new Map<string, commons.signature.SignaturePart>()
      signatureInfos
        .filter(({ signature }) => !!signature)
        .forEach(({ address, signature }) => {
          const suffix = ethers.utils.arrayify([2])
          const suffixed = ethers.utils.solidityPack(
            ['bytes', 'bytes'],
            [signature, suffix],
          )
          parts.set(address, { signature: suffixed, isDynamic: false })
        })

      // Get transaction digest
      const { chainId } = await provider.getNetwork()
      const transactions = [
        commons.transaction.toSequenceTransaction(wallet.address, transaction)
          .transaction,
      ]
      const subdigest = await getTransactionSubdigest(
        wallet,
        transactions,
        chainId,
      )

      // Encode for sending

      const nonce = await wallet.fetchNonceOrSpace()

      const signature = v2.coders.signature.encodeSigners(
        wallet.config,
        parts,
        [],
        chainId,
      ).encoded
      const bundle: commons.transaction.SignedTransactionBundle = {
        intent: {
          id: subdigest,
          wallet: wallet.address,
        },
        chainId,
        transactions,
        entrypoint: wallet.address,
        nonce,
        signature,
      }
      const tx = await wallet.sendSignedTransaction(bundle)
      setTxHash(tx.hash)
      await tx.wait()

      setStatus({ isError: false, text: 'Transaction sent!' })
    } catch (e) {
      console.error(e)
      setStatus({ isError: true, text: 'Unable to send transaction' })
    }
    setLoading(false)
  }

  if (!signer || !walletConfig || !transaction) return null

  return (
    <div className="card">
      <h2>Transaction Signatures</h2>
      {signatureInfos.map(s => (
        <div key={s.address}>
          <p>
            Signature for <code>{s.address}</code>
          </p>
          <Input
            type="text"
            defaultValue={s.signature}
            onChange={e => updateSignature(s.address, e.target.value)}
          />
        </div>
      ))}
      {canSend && (
        <button
          onClick={doSendTransaction}
          disabled={loading}
          style={{ marginTop: '1em' }}
        >
          Send transaction!
        </button>
      )}
      {txHash && (
        <p>
          Transaction hash is <code>{txHash}</code>
        </p>
      )}
      <ErrorText status={status} />
    </div>
  )
}

export default SendTransaction
