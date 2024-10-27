import * as net from "net";
import * as tls from "tls";

export default class ElectrumClient {
  constructor(
    netModule: typeof net,
    tlsModule: typeof tls | false,
    port: number,
    host: string,
    protocol: string,
  );

  initElectrum(options: {
    client: string;
    version: string;
    persistencePolicy?: { maxRetry: number; callback: (() => void) | null };
  }): Promise<void>;

  subscribe: {
    on(eventName: string, callback: (data: any) => void): void;
    removeAllListeners(event: string): void;
  };

  blockchainHeaders_subscribe(): Promise<any>;
  blockchainScripthash_subscribe(scriptHash: string): Promise<any>;
  blockchainScripthash_listunspent(scriptHash: string): Promise<any[]>;
  blockchainTransaction_get(
    transactionHash: string,
    verbose?: boolean,
  ): Promise<any>;
  blockchainScripthash_getBalance(scriptHash: string): Promise<any>;
  blockchainScripthash_getHistory(scriptHash: string): Promise<any[]>;
  blockchainEstimatefee(target: number): Promise<number>;
  blockchainTransaction_broadcast(txHex: string): Promise<string>;
  blockchainBlock_header(height: number): Promise<string>;
  blockchainBlock_headers(startHeight: number, count: number): Promise<any>;
  server_version(clientName: string, protocolVersion: string): Promise<string>;
  server_banner(): Promise<string>;
  server_features(): Promise<any>;
  server_ping(): Promise<null>;
  server_addPeer(features: any): Promise<any>;
  serverDonation_address(): Promise<string>;
  serverPeers_subscribe(): Promise<any>;
  blockchainAddress_getProof(address: string): Promise<any>;
  blockchain_relayfee(): Promise<number>;
  mempool_getFeeHistogram(): Promise<any[]>;

  close(): Promise<void>;
  reconnect(): Promise<void>;
  keepAlive(): void;

  onError: (e: Error) => void;
  onClose: (hadError: boolean) => void;
  onData: (data: Buffer | string) => void;
}
