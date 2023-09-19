import { createMultisig } from "./utils/multisig"
import { config, transaction, signatureParts } from "../config/config"
import { BigNumber, ethers } from "ethers"
import { commons, v2 } from "@0xsequence/core"
import { subDigestOf } from "@0xsequence/utils"
import { LocalRelayer } from "@0xsequence/relayer"

const main = async () => {
	if (!transaction) {
		throw new Error('No transaction to sign')
	}
	if (signatureParts.length < BigNumber.from(config.walletConfig.threshold).toNumber()) {
		throw new Error('Invalid signature parts')
	}

	const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl)
	const signers = config.signerPrivateKeys.map(key => new ethers.Wallet(key, provider))
	if (!config.relayer) {
		// Use first signer as a relayer as default
		config.relayer = new LocalRelayer(signers[0])
	}

	const wallet = await createMultisig(signers, config, provider, config.multisigAddress)
	const nonce = await wallet.fetchNonceOrSpace()
	const transactions = [commons.transaction.toSequenceTransaction(wallet.address, transaction).transaction]
	const digest = commons.transaction.digestOfTransactions(nonce, transactions)
	const subdigest = subDigestOf(wallet.address, config.network.chainId, digest)

	// Encode signature parts
  const parts = new Map<string, commons.signature.SignaturePart>()
	signatureParts.forEach(({ address, signature }) => {
		const suffix = ethers.utils.arrayify([2])
		const suffixed = ethers.utils.solidityPack(['bytes', 'bytes'], [signature, suffix])
		parts.set(address, {signature: suffixed, isDynamic: false })
	})

	const signature = v2.coders.signature.encodeSigners(wallet.config, parts, [], config.network.chainId).encoded

	const bundle: commons.transaction.SignedTransactionBundle = {
		intent: {
			id: subdigest,
			wallet: wallet.address
		},
		chainId: config.network.chainId,
		transactions,
		entrypoint: wallet.address,
		nonce,
		signature,
	}

	// Send it
	const tx = await wallet.sendSignedTransaction(bundle)
	await tx.wait()
}

main().then(() => {
	console.log('done')
	process.exit(0)
}).catch(err => {
	console.error(err)
	process.exit(1)
})
