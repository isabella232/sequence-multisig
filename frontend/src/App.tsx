import { commons } from '@0xsequence/core'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import './App.css'
import DeployMultisig from './components/DeployMultisig'
import SendTransaction from './components/SendTransaction'
import SignTransaction from './components/SignTransaction'
import TransactionDetails from './components/TransactionDetails'
import WalletConfiguration from './components/WalletConfiguration'
import sequenceLogo from '/logo512.png'

const App = () => {
  const [walletConfig, setWalletConfig] =
    useState<commons.config.SimpleConfig | null>(null)
  const [transaction, setTransaction] =
    useState<commons.transaction.Transaction | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  useEffect(() => {
    if (!window.ethereum) return
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.send('eth_requestAccounts', [])
    setSigner(provider.getSigner())
  }, [])

  return (
    <>
      <div>
        <img src={sequenceLogo} className="logo react" alt="React logo" />
      </div>
      <h1>Sequence Multisig</h1>
      <WalletConfiguration
        walletConfig={walletConfig}
        setWalletConfig={setWalletConfig}
      />
      <DeployMultisig walletConfig={walletConfig} signer={signer} />
      <TransactionDetails
        transaction={transaction}
        setTransaction={setTransaction}
      />
      <SignTransaction
        signer={signer}
        transaction={transaction}
        walletConfig={walletConfig}
      />
      <SendTransaction
        signer={signer}
        transaction={transaction}
        walletConfig={walletConfig}
      />
    </>
  )
}

export default App
