import { commons } from '@0xsequence/core'
import { subDigestOf } from '@0xsequence/utils'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { createMultisig } from '../utils/multisig'
import ErrorText, { StatusTextProps } from './StatusText'

export type SignTransactionProps = {
  walletConfig: commons.config.SimpleConfig | null
  transaction: commons.transaction.Transaction | null
  signer: ethers.Signer | null
}

const SignTransaction: React.FC<SignTransactionProps> = ({
  walletConfig,
  transaction,
  signer,
}) => {
  const [invalidSigner, setInvalidSigner] = useState<boolean>(false)
  const [status, setStatus] = useState<StatusTextProps>()
  const [signatureInfo, setSignatureInfo] = useState<{address: string, signature: string} | undefined>()

  useEffect(() => {
    if (!signer || !walletConfig) return
    signer.getAddress().then(address => {
      if (walletConfig.signers.find(s => s.address === address)){
        setStatus(undefined)
        setInvalidSigner(false)
      } else {
        setStatus({ isError: true, text: 'Connected signer is a not a multisig signer' })
        setInvalidSigner(true)
      }
    })
  }, [signer, walletConfig])

  if (!signer || !walletConfig || !transaction) return null

  const doSign = async () => {
    setStatus(undefined)
    setSignatureInfo(undefined)
    try {
      const address = await signer.getAddress()
      if (!walletConfig.signers.find(s => s.address === address)){
        setStatus({ isError: true, text: 'Connected signer is a not a multisig signer' })
        return
      }

      // Create wallet
      const wallet = await createMultisig([signer], walletConfig)
      if (!wallet) throw new Error('Unable to create multisig wallet')
      const nonce = await wallet.fetchNonceOrSpace()

      // Get transaction digest
      const transactions = [
        commons.transaction.toSequenceTransaction(wallet.address, transaction)
          .transaction,
      ]
      const digest = commons.transaction.digestOfTransactions(
        nonce,
        transactions,
      )
      const chainId = (await signer.provider?.getNetwork())?.chainId
      const subdigest = subDigestOf(
        wallet.address,
        chainId ?? 1,
        digest,
      )
      const subdigestBytes = ethers.utils.arrayify(subdigest)

      // Sign it
      const signature = await signer.signMessage(subdigestBytes)
      if (!signature) throw new Error('No signature')
      setSignatureInfo({address, signature})
    } catch (e) {
      setStatus({ isError: true, text: 'Unable to sign transaction' })
    }
  }

  return (
    <div className="card">
      <button onClick={doSign} disabled={invalidSigner}>Sign Transaction!</button>
      {signatureInfo &&
      <>
        <p>
          Send this signature to the other signers.
        </p>
        <p>Signed by {signatureInfo.address}</p>
        <code style={{margin: '1em'}}>{signatureInfo.signature}</code>
      </>
      }
      <ErrorText status={status} />
    </div>
  )
}

export default SignTransaction
