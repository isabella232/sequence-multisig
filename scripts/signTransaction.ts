import { createMultisig } from "./utils/multisig"
import { config, transaction } from "../config/config"
import { ethers } from "ethers"
import { commons } from "@0xsequence/core"
import { subDigestOf } from "@0xsequence/utils"

const main = async () => {
	if (!transaction) {
		throw new Error('No transaction to sign')
	}
	const transactions = [transaction]

	const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl)
	const signers = config.signerPrivateKeys.map(key => new ethers.Wallet(key, provider))

	const wallet = await createMultisig(signers, config, provider, config.multisigAddress)
	const nonce = await wallet.fetchNonceOrSpace()
	const digest = commons.transaction.digestOfTransactions(nonce, transactions)
	const subdigest = subDigestOf(wallet.address, config.network.chainId, digest)
	const subdigestBytes = ethers.utils.arrayify(subdigest)

	// Sign transaction with available signers
	for (const signer of signers) {
		const address = await signer.getAddress()
		const signature = await signer.signMessage(subdigestBytes)
		console.log('Signature of', address, 'is:', signature)
	}
}

main().then(() => {
	console.log('done')
	process.exit(0)
}).catch(err => {
	console.error(err)
	process.exit(1)
})
