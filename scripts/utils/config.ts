import type { NetworkConfig } from '@0xsequence/network'
import type { Relayer } from '@0xsequence/relayer'
import type { commons } from '@0xsequence/core'
import { readFile } from 'fs/promises'

export type Config = {
  // Known keys of the signers of the multisig wallet
  signerPrivateKeys: string[]
  // Wallet configuration
  walletConfig: commons.config.SimpleConfig
  // The network to use
  network: NetworkConfig
  // Relayer for transactions. Defaults to first signer
  relayer?: Relayer
  // The address of the multisig wallet (if known)
  multisigAddress?: string
}

export const readConfig = async (path: string) => {
  return JSON.parse(await readFile(path, 'utf8')) as Config
}

export const readTransaction = async (path: string) => {
  return JSON.parse(
    await readFile(path, 'utf8'),
  ) as commons.transaction.Transaction
}
