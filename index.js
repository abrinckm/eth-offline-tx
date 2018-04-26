/*
MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const ajv = new require('ajv')();

let validate = ajv.compile({
  '$schema': 'http://json-schema.org/schema#',
  'definitions': {
    'walletOption': {
      'type': 'object',
      'properties': {
        'wallet': {
          'oneOf': [
            { 'type': 'object' },
            { 'type': 'string' }
          ]
        },
        'password': { 'type': 'string' }
      },
      'required': ['wallet', 'password'],
      'additionalProperties': true
    },
    'credentialsOption': {
      'type': 'object',
      'properties': {
        'privateKey': { 'type': 'string' }
      },
      'required': ['privateKey'],
      'additionalProperties': true
    }
  },
  'oneOf': [
    { '$ref': '#/definitions/walletOption' },
    { '$ref': '#/definitions/credentialsOption' }
  ]
});

// ---
class EthOfflineTx {

  constructor(provider) {
    if (!provider) {
      throw new Error('provider is required.');
    }
    const w3 = new Web3(new Web3.providers.HttpProvider(provider));
    this.w3 = w3;
  }

  // ----
  async createOfflineTransaction(tx, options) {
    let _tx = await this._offlineTransaction(tx, options);
    return _tx;
  }

  // ----
  signOfflineTransaction(tx, options) {
    let valid = validate(options);
    if (!valid) {
      let errorMessage = validate.errors.reduce((msg, err) => { 
        msg += err.message+'\n'; 
        return msg; 
      }, '\n');
      throw new Error(errorMessage);
    }

    if (options.wallet) {
      options.privateKey = '';
      let walletContents = require('fs').readFileSync(options.wallet);
      try {
        walletContents = JSON.parse(walletContents);
      } catch(e) {
        throw new Error('Wallet contents are not JSON parseable.');
      }
      let credentials = this.w3.eth.accounts.decrypt(walletContents, options.password);
      options.privateKey = credentials.privateKey;
    }

    let privateKey = new Buffer(options.privateKey.replace('0x', ''), 'hex');

    tx.sign(privateKey);
    let serialized = tx.serialize();
    return '0x'+serialized.toString('hex');
  }

  // ---
  _offlineTransaction(options) {
    if (!this.from && !options.from) {
      throw new Error('An offline transaction requires the public key to get nonce.');
    }

    let { abi, to, gas, gasPrice, value, 
          method, args, from, gasLimit } = options;

    let contract, w3 = this.w3;
    if (method||abi) {
      if (!(method&&to&&abi)) {
        throw new Error('A smart contract transaction needs these options: method, to, abi.');
      }
      contract = new this.w3.eth.Contract(abi, to);
    }

    let rawTx = {
      from: from,
      to: to,
      gas: gas,
      gasLimit: gasLimit,
      gasPrice: w3.utils.toHex(w3.utils.toWei(gasPrice, 'gwei')),
      value: value
    };

    return this.w3.eth.getTransactionCount(from)
      .then(nonce => {
        rawTx.nonce = nonce;
        if (contract) {
          rawTx.data = contract.methods[method](...args.map(arg=>w3.utils.toHex(arg))).encodeABI();
        }
        rawTx = Object.keys(rawTx).reduce((raw, prop) => { 
          if (rawTx[prop] !== undefined && rawTx[prop] !== null) {
            raw[prop]=rawTx[prop];
          } 
          return raw; 
        }, {});
        return new Tx(rawTx);
      })
    ;
  }
}

module.exports = EthOfflineTx;