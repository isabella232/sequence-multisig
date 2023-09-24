import { commons } from '@0xsequence/core'
import { subDigestOf } from '@0xsequence/utils'
import { BigNumberish } from 'ethers'
import { WalletType } from './multisig'

export const getTransactionSubdigest = async (
  wallet: WalletType,
  transactions: commons.transaction.Transaction[],
  chainId: BigNumberish,
) => {
  const nonce = await wallet.fetchNonceOrSpace()
  const digest = commons.transaction.digestOfTransactions(nonce, transactions)
  return subDigestOf(wallet.address, chainId, digest)
}
