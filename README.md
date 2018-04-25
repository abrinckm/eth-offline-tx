## Eth-Offline-Tx

This project is licensed under the terms of the MIT license.

### Description

The purpose here is to simplify creating and signing offline ethereum transactions into two easy functions: 
* create `offlineTransaction({<txn_details>})`
* sign `signOfflineTransaction(txn, {<credentials>})`

### Installation

`npm install eth-offline-tx`

### Usage

```
const EthOfflineTx = require('eth-offline-tx');

let provider = 'https://rinkeby.infura.io/<token_redacted>';
const eoff = new EthOfflineTx(provider);

// Create the offline transaction
eoff.offlineTransaction({
  publicKey:'0x2e507a9352147b9cbe4f84eea867a827e445967c',
  to:'0x15c9ffbad7e2382903c3b2cc3addb29679498e6b', 
  abi: abi, 
  method: 'voteForCandidate', 
  args: ['ThisGuy'],
  gasPrice: '55',
  gas: 400000,
  value: 0
})

// Sign the offline transaction with either wallet & password, or by passing in the private key directly
.then(txn => {
  let signedTransaction;
  signedTransaction = eoff.signOfflineTransaction(txn, {wallet: '/path/to/wallet', password: '<password>'});
  //     -- OR using credentials directly --
  signedTransaction = eoff.signOfflineTransaction(txnm, {privateKey: '<private_key>'});

  // send signed transaction using web3 or whatever you wish to use and wait for the receipt!
  // Example using web3:
  eoff.w3.eth.sendSignedTransaction(signedTransaction)
    .on('receipt', console.log);
});
```
