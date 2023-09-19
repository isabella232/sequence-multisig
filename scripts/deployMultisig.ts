import { createMultisig } from "./utils/multisig"
import { config } from "../config/config"
import { ethers } from "ethers"
import { LocalRelayer } from "@0xsequence/relayer"

const main = async () => {
	const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl)
	const signers = config.signerPrivateKeys.map(key => new ethers.Wallet(key, provider))

	if (!config.relayer) {
		// Use first signer as a relayer as default
		config.relayer = new LocalRelayer(signers[0])
	}
	const wallet = await createMultisig(signers, config, provider)

	if (!await wallet.reader().isDeployed(wallet.address)) {
		console.log('Deploying multisig wallet at address:', wallet.address)
		await wallet.deploy()
	}

	console.log('Multisig wallet address:', wallet.address)
}

main().then(() => {
	console.log('done')
	process.exit(0)
}).catch(err => {
	console.error(err)
	process.exit(1)
})
