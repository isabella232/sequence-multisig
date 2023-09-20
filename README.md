# Sequence Wallet Scripts

A repo for testing various scripts with Sequence wallets.

## Multi Signature Wallet Usage

A multisig wallet is a powerful tool as it allows an address to be controlled by multiple entities.
Sequence supports a range of configurations but currently lacks tooling to support keys owned by multiple parties.
This script enables multiple key owners to sign and send a transactions using a multisig wallet without the need for sharing keys.

### Setup

Each signer must complete the following.

Make a copy of `config.sample.json` and update the configuration.
The configuration type is defined in `scripts/utils/config.ts`.

Install dependencies:

```bash
yarn
```

### Deployment

The multisig wallet may be deployed using the following command:

```bash
yarn sequence-multisig deploy -c config.json
```

This uses the configuration supplied in `config.json` to deploy the multisig wallet.

### Sending a Transaction

Create the transaction you wish to send in a JSON file.
The transaction type is defined in `commons.transaction.Transaction` from `@0xsequence/core`.
An example is located in `transaction.sample.json`.

Share this transaction file with other signers.

Each signer should run the following command:

```bash
yarn sequence-multisig send -c config.json -t transaction.json
```

The script will output the transaction subdigest which can be used by external EOA interfaces to sign the transaction.
Please note that the script is expecting signatures from non-contract wallets.
Contract wallets and abstract accounts are not supported.

The script will automatically sign the transaction with the keys defined in the configuration file.

The script will prompt for missing signatures from other signers.
If these are not available, simply press enter to skip.

If the threshold is not met, the currently known signatures will be output to the console.
These can be shared with other signers to complete the transaction.

If the signature threshold is met, the script will prompt for the transaction to be sent to the network.
