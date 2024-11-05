'use strict';

const Client = require('./lib/client');

class ElectrumClient extends Client {

  initElectrum(electrumConfig, persistencePolicy = { maxRetry: 1000, callback: null }, timeout = 0) {
    this.timeout = timeout;
    this.persistencePolicy = persistencePolicy;
    this.electrumConfig = electrumConfig;
    return this.connect().then(() => this.server_version(this.electrumConfig.client, this.electrumConfig.version));
  }

  onClose() {
    super.onClose();
    const list = [
      'blockchain.headers.subscribe',
      'blockchain.scripthash.subscribe',
    ];
    list.forEach(event => this.subscribe.removeAllListeners(event));
    setTimeout(() => {
      if (this.persistencePolicy != null && this.persistencePolicy.maxRetry > 0) {
        this.reconnect();
        this.persistencePolicy.maxRetry -= 1;
      } else if (this.persistencePolicy != null && this.persistencePolicy.callback != null) {
        this.persistencePolicy.callback();
      } else if (this.persistencePolicy == null) {
        this.reconnect();
      }
    }, 1000);
  }

  request(method, params) {
    const parentPromise = super.request(method, params);

    if (this.timeout > 0) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${this.timeout} ms.`)), this.timeout)
      );
      return Promise.race([parentPromise, timeoutPromise]);
    }

    return parentPromise;
  }

  requestBatch(method, params, secondParam) {
    const parentPromise = super.requestBatch(method, params, secondParam);

    if (this.timeout > 0) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${this.timeout} ms.`)), this.timeout)
      );
      return Promise.race([parentPromise, timeoutPromise]);
    }

    return parentPromise;
  }

  close() {
    super.close();
    this.reconnect = this.onClose = () => {}; // dirty hack to make it stop reconnecting
  }

  reconnect() {
    console.log('electrum reconnect');
    this.initSocket();
    return this.initElectrum(this.electrumConfig);
  }

  // ElectrumX API
  server_version(client_name, protocol_version) {
    return this.request('server.version', [client_name, protocol_version]);
  }
  server_banner() {
    return this.request('server.banner', []);
  }
  server_features() {
    return this.request('server.features', []);
  }
  server_ping() {
    return this.request('server.ping', []);
  }
  server_addPeer(features) {
    return this.request('server.add_peer', [features]);
  }
  serverDonation_address() {
    return this.request('server.donation_address', []);
  }
  serverPeers_subscribe() {
    return this.request('server.peers.subscribe', []);
  }
  blockchainAddress_getProof(address) {
    return this.request('blockchain.address.get_proof', [address]);
  }
  blockchainScripthash_getBalance(scripthash) {
    return this.request('blockchain.scripthash.get_balance', [scripthash]);
  }
  blockchainScripthash_getBalanceBatch(scripthash) {
    return this.requestBatch('blockchain.scripthash.get_balance', scripthash);
  }
  blockchainScripthash_listunspentBatch(scripthash) {
    return this.requestBatch('blockchain.scripthash.listunspent', scripthash);
  }
  blockchainScripthash_getHistory(scripthash) {
    return this.request('blockchain.scripthash.get_history', [scripthash]);
  }
  blockchainScripthash_getHistoryBatch(scripthash) {
    return this.requestBatch('blockchain.scripthash.get_history', scripthash);
  }
  blockchainScripthash_getMempool(scripthash) {
    return this.request('blockchain.scripthash.get_mempool', [scripthash]);
  }
  blockchainScripthash_listunspent(scripthash) {
    return this.request('blockchain.scripthash.listunspent', [scripthash]);
  }
  blockchainScripthash_subscribe(scripthash) {
    return this.request('blockchain.scripthash.subscribe', [scripthash]);
  }
  blockchainBlock_header(height) {
    return this.request('blockchain.block.header', [height]);
  }
  blockchainBlock_headers(start_height, count) {
    return this.request('blockchain.block.headeres', [start_height, count]);
  }
  blockchainEstimatefee(number) {
    return this.request('blockchain.estimatefee', [number]);
  }
  blockchainHeaders_subscribe() {
    return this.request('blockchain.headers.subscribe', []);
  }
  blockchain_relayfee() {
    return this.request('blockchain.relayfee', []);
  }
  blockchainTransaction_broadcast(rawtx) {
    return this.request('blockchain.transaction.broadcast', [rawtx]);
  }
  blockchainTransaction_get(tx_hash, verbose) {
    return this.request('blockchain.transaction.get', [tx_hash, verbose || false]);
  }
  blockchainTransaction_getBatch(tx_hash, verbose) {
    return this.requestBatch('blockchain.transaction.get', tx_hash, verbose);
  }
  blockchainTransaction_getMerkle(tx_hash, height) {
    return this.request('blockchain.transaction.get_merkle', [tx_hash, height]);
  }
  mempool_getFeeHistogram() {
    return this.request('mempool.get_fee_histogram', []);
  }
}

module.exports = ElectrumClient;
