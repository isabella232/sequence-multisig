# Sequence Wallet Scripts

A repo for testing various scripts with Sequence wallets.

## Usage

Download the repo.

Copy `config/config.sample.ts` to `config/config.ts` and update the configuration.

Install dependencies:

```bash
yarn
```

Create the multisig wallet:

```bash
yarn run deployMultisig
```

Take the output address and add it back into the `config/config.ts` file.

Have each signer create their signature for the transaction:

```bash
yarn run signTransaction
```

Take the output signature for each address and add it back into the `config/config.ts` file.

Combine and send the transaction with the combined signatures:

```bash
yarn run sendTransaction
```
