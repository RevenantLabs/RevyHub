import { Keypair } from "@stellar/stellar-sdk";
import type {
  NetworkComparisonResult,
  NetworkSnapshotSuccess
} from "@/features/network-comparison/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const testAccount = seed(42).publicKey();

export const testnetRootResponse = {
  _links: { self: { href: "https://horizon-testnet.stellar.org/" } },
  horizon_version: "2.29.0",
  core_version: "stellar-core 21.1.0",
  ingest_latest_ledger: 1_234_567,
  history_latest_ledger: 1_234_567,
  history_latest_ledger_closed_at: "2026-09-12T05:00:00Z",
  history_elder_ledger: 1,
  core_latest_ledger: 1_234_567,
  network_passphrase: "Test SDF Network ; September 2015",
  current_protocol_version: 21,
  supported_protocol_version: 21,
  core_supported_protocol_version: 21
};

export const mainnetRootResponse = {
  _links: { self: { href: "https://horizon.stellar.org/" } },
  horizon_version: "2.28.1",
  core_version: "stellar-core 20.4.0",
  ingest_latest_ledger: 54_321_000,
  history_latest_ledger: 54_321_000,
  history_latest_ledger_closed_at: "2026-09-12T04:59:58Z",
  history_elder_ledger: 1,
  core_latest_ledger: 54_321_000,
  network_passphrase: "Public Global Stellar Network ; September 2015",
  current_protocol_version: 20,
  supported_protocol_version: 20,
  core_supported_protocol_version: 20
};

export const testnetLedgerResponse = {
  _links: { self: { href: "" } },
  _embedded: {
    records: [
      {
        sequence: 1_234_567,
        closed_at: "2026-09-12T05:00:00Z",
        protocol_version: 21,
        base_fee_in_stroops: 100,
        base_reserve_in_stroops: 5_000_000
      }
    ]
  }
};

export const mainnetLedgerResponse = {
  _links: { self: { href: "" } },
  _embedded: {
    records: [
      {
        sequence: 54_321_000,
        closed_at: "2026-09-12T04:59:58Z",
        protocol_version: 20,
        base_fee_in_stroops: 100,
        base_reserve_in_stroops: 5_000_000
      }
    ]
  }
};

export const mockTestnetSnapshot: NetworkSnapshotSuccess = {
  status: "online",
  network: "testnet",
  observedAt: "2026-09-12T05:00:00.000Z",
  ledgerSequence: 1_234_567,
  closedAt: "2026-09-12T05:00:00Z",
  protocolVersion: 21,
  coreSupportedProtocolVersion: 21,
  horizonVersion: "2.29.0",
  coreVersion: "stellar-core 21.1.0",
  baseFeeInStroops: "100",
  baseReserveInStroops: "5000000",
  ingestLatestLedger: 1_234_567,
  historyLatestLedger: 1_234_567,
  coreLatestLedger: 1_234_567,
  networkPassphrase: "Test SDF Network ; September 2015"
};

export const mockMainnetSnapshot: NetworkSnapshotSuccess = {
  status: "online",
  network: "mainnet",
  observedAt: "2026-09-12T05:00:00.000Z",
  ledgerSequence: 54_321_000,
  closedAt: "2026-09-12T04:59:58Z",
  protocolVersion: 20,
  coreSupportedProtocolVersion: 20,
  horizonVersion: "2.28.1",
  coreVersion: "stellar-core 20.4.0",
  baseFeeInStroops: "100",
  baseReserveInStroops: "5000000",
  ingestLatestLedger: 54_321_000,
  historyLatestLedger: 54_321_000,
  coreLatestLedger: 54_321_000,
  networkPassphrase: "Public Global Stellar Network ; September 2015"
};

export const mockComparisonResult: NetworkComparisonResult = {
  testnet: mockTestnetSnapshot,
  mainnet: mockMainnetSnapshot,
  protocolComparison: {
    testnetProtocol: 21,
    mainnetProtocol: 20,
    hasDifference: true,
    testnetAhead: true,
    differenceCount: 1
  },
  baseFeeComparison: {
    testnetStroops: "100",
    mainnetStroops: "100",
    differenceStroops: "0",
    hasDifference: false
  },
  baseReserveComparison: {
    testnetStroops: "5000000",
    mainnetStroops: "5000000",
    differenceStroops: "0",
    hasDifference: false
  },
  observedAt: "2026-09-12T05:00:00.000Z"
};
