import { useState } from 'react'
import type { commons } from '@0xsequence/core'
import ErrorText, { StatusTextProps } from './base/StatusText'
import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { Textarea } from './base/TextArea'

// Parsers
const BigNumberish = t.union([t.string, t.number])
const SimpleSigner = t.type({
  address: t.string,
  weight: BigNumberish,
})
const SimpleConfig = t.type({
  threshold: BigNumberish,
  checkpoint: BigNumberish,
  signers: t.array(SimpleSigner),
})

export type WalletConfigurationProps = {
  walletConfig: commons.config.SimpleConfig | null
  setWalletConfig: React.Dispatch<
    React.SetStateAction<commons.config.SimpleConfig | null>
  >
}

const WalletConfiguration: React.FC<WalletConfigurationProps> = ({
  walletConfig,
  setWalletConfig,
}) => {
  const [status, setStatus] = useState<StatusTextProps>()

  const updateWalletConfig = (walletConfigStr: string) => {
    try {
      const decoded = SimpleConfig.decode(JSON.parse(walletConfigStr))
      if (E.isRight(decoded)) {
        setStatus({ isError: false, text: 'Valid wallet config.' })
        setWalletConfig(decoded.right)
      } else {
        setStatus({ isError: true, text: PathReporter.report(decoded)[0] })
      }
    } catch (e) {
        setStatus({ isError: true, text: 'Invalid JSON' })
    }
  }

  return (
    <div className="card">
      <h2>Wallet Configuration</h2>
      <p>Set your wallet configuration here.</p>
      <Textarea
        placeholder="Wallet Configuration"
        defaultValue={walletConfig ? JSON.stringify(walletConfig, null, 2) : ''}
        onChange={e => updateWalletConfig(e.target.value)}
      />
      <ErrorText status={status} />
    </div>
  )
}

export default WalletConfiguration
