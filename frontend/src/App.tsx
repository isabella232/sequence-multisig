import { useState } from 'react'
import sequenceLogo from '/logo512.png'
import './App.css'
import WalletConfiguration from './components/WalletConfiguration'
import { commons } from '@0xsequence/core'
import TransactionDetails from './components/TransactionDetails'

const App = () => {
  const [walletConfig, setWalletConfig] = useState<commons.config.SimpleConfig | null>(null)
  const [transaction, setTransaction] = useState<commons.transaction.Transaction | null>(null)

  return (
    <>
      <div>
        <img src={sequenceLogo} className="logo react" alt="React logo" />
      </div>
      <h1>Sequence Multisig</h1>
      <WalletConfiguration walletConfig={walletConfig} setWalletConfig={setWalletConfig} />
      <TransactionDetails transaction={transaction} setTransaction={setTransaction} />
    </>
  )
}

export default App
