const W3 = require('web3');
const Tx = require('ethereumjs-tx');
const proxyquire =  require('proxyquire');
const mocha = require('mocha');
const assert = require('assert');

const mockData = {
  nonce: 1,
  publicKey: '0x9b110a88c6837ebc91795a23feecb470c5dd204b',
  privateKey: '09276f96ee5de7a8d2967415af6eaa3fd691c14cc313668108327ddc6caffd8b',
  to: '0x5e8a291d09010ed88e4b7286400340179b77a00b',
  abi: [{"constant":false,"inputs":[{"name":"a","type":"bytes32"}],"name":"func","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
};

class Web3Mock extends W3 {    
  constructor() {
    super(...arguments);
    this.eth.accounts.decrypt = () => { return {privateKey: mockData.privateKey} };
    this.eth.getTransactionCount = () => Promise.resolve(mockData.nonce);
  }
};

const EthOfflineTx = proxyquire('../',  { 'web3': Web3Mock });
const eoff = new EthOfflineTx('http://');

const _txn = {
  from: mockData.publicKey,
  to: mockData.to,
  abi: mockData.abi,
  method: 'func',
  args: ['blah'],
  gasPrice: '55',
  gas: 707000,
  value: 0
};

/*
* createOfflineTransaction transfer ether from to account
* createOfflineTransaction transfer error no public key
* createOfflineTransaction smart contract call to method
* createOfflineTransaction smart contract error not enough info
* createOfflineTransaction should include params: from, to, gas, gasPrice, value, gasLimit [, data ]
* signOfflineTransaction error should be instance of ethereumjs-tx
* signOfflineTransaction error should have credentials
* signOfflineTransaction wallet should be parseable
* signOfflineTransaction returns signed and serialized txn
*/

describe('EthOfflineTx', function() {
  let rawTxn;
  describe('#createOfflineTransaction()', function() {
    it('should create offline smart contract transaction', function(done) {
      eoff.createOfflineTransaction(_txn)
        .then(_rawTxn => { 
          rawTxn = _rawTxn;
          assert(rawTxn instanceof Tx)
          done();
        })
        .catch(e=>done(e))
      ;
    });
  });
});

//   let signedTransaction = eoff.signOfflineTransaction(tx, 
//     {privateKey: mockData.privateKey})
//   ;

