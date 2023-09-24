# Front End

This front end implementation of the multisig scripts allows you to interact with the scripts via a web interface.

## Usage

Install dependencies and run the front end.

```bash
yarn
yarn dev
```

Open your browser to the URL displayed in the console.

Follow the pattern described in the [main README](../README.md) to deploy and send transactions.

1. Loading the page will prompt you to connect your wallet.
2. Load the wallet configuration in the first text box.
3. Deploy the multisig wallet if not already deployed.
4. Load the transaction configuration in the second text box.
5. Sign the transaction with the connected wallet.
6. Share the signature, wallet configuration and transaction configuration with other signers.
7. One signer inputs the signatures into the lower text boxes and sends the transaction.
