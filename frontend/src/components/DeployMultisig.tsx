import { commons } from '@0xsequence/core'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { createMultisig } from '../utils/multisig'
import ErrorText, { StatusTextProps } from './StatusText'

export type DeployMultisigProps = {
  walletConfig: commons.config.SimpleConfig | null
  signer: ethers.Signer | null
}

const DeployMultisig: React.FC<DeployMultisigProps> = ({
  walletConfig,
  signer,
}) => {
  const [canDeploy, setCanDeploy] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<StatusTextProps>()

  useEffect(() => {
    if (!signer || !walletConfig) {
      setCanDeploy(false)
      return
    }
    createMultisig([signer], walletConfig).then(async wallet => {
      setStatus(undefined)
      if (!wallet) {
        setCanDeploy(false)
        return
      }
      if (await wallet.reader().isDeployed(wallet.address)) {
        setStatus({
          isError: false,
          text: `Wallet deployed to ${wallet.address}`,
        })
        setCanDeploy(false)
        return
      }
      setCanDeploy(true)
    })
  }, [signer, walletConfig])

  const doDeploy = async () => {
    if (!signer || !walletConfig) return
    setStatus(undefined)
    setLoading(false)
    try {
      // Create wallet
      const wallet = await createMultisig([signer], walletConfig)
      if (!wallet) throw new Error('Unable to create multisig wallet')

      setLoading(true)

      const tx = await wallet.deploy()
      await tx.wait()

      setStatus({ isError: false, text: 'Deployed multisig wallet!' })
    } catch (e) {
      console.error(e)
      setStatus({ isError: true, text: 'Unable to deploy transaction' })
    }
    setLoading(false)
  }

  if (!signer || !walletConfig) return null

  return (
    <div className="card">
      {canDeploy && (
        <button onClick={doDeploy} disabled={loading}>
          Deploy wallet!
        </button>
      )}
      <ErrorText status={status} />
    </div>
  )
}

export default DeployMultisig
