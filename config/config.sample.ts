import type { NetworkConfig } from '@0xsequence/network'
import type { Relayer } from '@0xsequence/relayer'
import type { commons } from '@0xsequence/core'
import { ethers } from 'ethers'

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

const walletConfig: commons.config.SimpleConfig = {
  threshold: 2,
  checkpoint: 0,
  signers: [
    {
      address: '0x6B659aB3A1E8D8A05092A6961515487174d13c90',
      weight: 1,
    },
    {
      address: '0x721B21F376bddFCDa0f7a7be28129FA4F9D94011',
      weight: 1,
    },
  ],
}

export const config: Config = {
  // Add your known signer pk here
  signerPrivateKeys: [],
  walletConfig,
  network: {
    chainId: 11155111,
    name: 'sepolia',
    rpcUrl: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
  },
  // Update after the multisig is deployed
  // multisigAddress: '',
}

// Populate the transaction information for signing
export const transaction: commons.transaction.Transaction | null = {
  to: '0x721B21F376bddFCDa0f7a7be28129FA4F9D94011',
  value: ethers.constants.WeiPerEther.div(100), // 0.01 ETH
}

// A list of signatures to combine
export const signatureParts: {
  address: string
  signature: string
}[] = [
  // Add after each signer has signed
  {
    address: '0x6B659aB3A1E8D8A05092A6961515487174d13c90',
    signature:
      '0x7c0ecbb47be34eb428fa7d9b32000c806c8e843db19ce0222e3eb5fa71c340c06431a096db4c708fda385f121ffc8f14a73a2cdd5a15d67d1f617a0b73e1414a1c',
  },
]
