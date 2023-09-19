import { Wallet } from '@0xsequence/wallet'
import type { ethers } from 'ethers'
import { V2_WALLET_CONTEXT } from './constants'
import { Orchestrator } from '@0xsequence/signhub'
import { commons, v2 } from '@0xsequence/core'
import type { Config } from '../../config/config'

export const createMultisig = async (
  signers: ethers.Signer[],
  config: Config,
  provider: ethers.providers.Provider,
  multisigAddress?: string,
) => {
  const walletConfig = v2.coders.config.fromSimple(config.walletConfig)
  const address =
    multisigAddress ??
    commons.context.addressOf(
      V2_WALLET_CONTEXT,
      v2.coders.config.imageHashOf(walletConfig),
    )

  const wallet = new Wallet({
    coders: {
      signature: v2.signature.SignatureCoder,
      config: v2.config.ConfigCoder,
    },
    context: V2_WALLET_CONTEXT,
    config: walletConfig,
    chainId: config.network.chainId,
    address,
    orchestrator: new Orchestrator(signers),
    provider: provider,
    relayer: config.relayer,
  })

  return wallet
}
