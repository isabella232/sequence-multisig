import { useState } from 'react'
import type { commons } from '@0xsequence/core'
import ErrorText, { StatusTextProps } from './base/StatusText'
import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { Textarea } from './base/TextArea'

// Parsers
const BigNumberish = t.union([t.string, t.number])
const TransactionType = t.type({
  to: t.string,
  value: t.union([BigNumberish, t.undefined]),
  data: t.union([t.string, t.undefined]),
  gasLimit: t.union([BigNumberish, t.undefined]),
  delegateCall: t.union([t.boolean, t.undefined]),
  revertOnError: t.union([t.boolean, t.undefined]),
});

export type TransactionDetailsProps = {
  transaction: commons.transaction.Transaction | null
  setTransaction: React.Dispatch<
    React.SetStateAction<commons.transaction.Transaction | null>
  >
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  setTransaction,
}) => {
  const [status, setStatus] = useState<StatusTextProps>()

  const updateTransactionDetails = (walletConfigStr: string) => {
    try {
      const decoded = TransactionType.decode(JSON.parse(walletConfigStr))
      if (E.isRight(decoded)) {
        setStatus({ isError: false, text: 'Valid transaction details.' })
        setTransaction(decoded.right)
      } else {
        setStatus({ isError: true, text: PathReporter.report(decoded)[0] })
      }
    } catch (e) {
        setStatus({ isError: true, text: 'Invalid JSON' })
    }
  }

  return (
    <div className="card">
      <h2>Transaction Details</h2>
      <Textarea
        placeholder="Transaction Details"
        defaultValue={transaction ? JSON.stringify(transaction, null, 2) : ''}
        onChange={e => updateTransactionDetails(e.target.value)}
      />
      <ErrorText status={status} />
    </div>
  )
}

export default TransactionDetails
