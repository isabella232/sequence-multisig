import { LocalRelayer } from '@0xsequence/relayer'
import { confirm } from '@inquirer/prompts'
import { ethers } from 'ethers'
import ora from 'ora'
import type { Config } from './utils/config'
import { createMultisig } from './utils/multisig'

export const deploy = async (config: Config) => {
  const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl)
  const signers = config.signerPrivateKeys.map(
    key => new ethers.Wallet(key, provider),
  )

  if (!config.relayer) {
    // Use first signer as a relayer as default
    config.relayer = new LocalRelayer(signers[0])
  }
  const wallet = await createMultisig(signers, config, provider)

  if (!(await wallet.reader().isDeployed(wallet.address))) {
    // Not deployed
    console.log('Multisig wallet is not deployed.')
    const answer = await confirm({
      message: 'Would you like to deploy the wallet?',
    })
    if (answer) {
      // Deploy it
      const spinner = ora(
        `Deploying multisig wallet at address: ${wallet.address}`,
      ).start()
      await wallet.deploy()
      spinner.succeed('Deployed multisig wallet')
    }
  }

  console.log('Multisig wallet address:', wallet.address)
}
