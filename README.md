# Eth-Offline-Tx

This project is licensed under the terms of the MIT license.

(WIP) Not guaranteed to work for all use cases. But its heading in that direction.

## Installation

`npm install eth-offline-tx`

## Description

The purpose here is to simplify creating and signing offline ethereum transactions into two easy functions: 
* `createOfflineTransaction({<txn_details>})`
* `signOfflineTransaction(txn, {<credentials>})`

## Requirements

You will need to provide the following info:
* HttpProvider for the Ethereum client
* Wallet & Password OR credentials (public/private key)

Additionally if you are making a smart contract transaction:
* ABI Definition
* Contract Address

## Usage

```
const EthOfflineTx = require('eth-offline-tx');

let provider = 'https://rinkeby.infura.io/<token_redacted>';
const eoff = new EthOfflineTx(provider);

// Create the offline transaction
eoff.offlineTransaction({
  publicKey:'<public_key_redacted>',
  to:'<contract_address_redacted>', 
  abi: abi, 
  method: 'voteForCandidate', 
  args: ['ThisGuy'],
  gasPrice: '55',
  gas: 400000,
  value: 0
})

// Sign the offline transaction with either wallet & password,
//   or by passing in the private key directly
.then(txn => {
  let signedTransaction;

  signedTransaction = eoff.signOfflineTransaction(txn, 
    {wallet: '/path/to/wallet', password: '<password>'});

  //     -- OR using credentials directly --

  signedTransaction = eoff.signOfflineTransaction(txn, 
    {privateKey: '<private_key>'});

  // send signed transaction and wait for the receipt!

  // Example using web3:
  eoff.w3.eth.sendSignedTransaction(signedTransaction)
    .on('receipt', console.log);
});
```
