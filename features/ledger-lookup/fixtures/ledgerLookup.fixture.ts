export const sampleSequence = 50_000_000;
export const futureSequence = 60_000_000;
export const missingSequence = 1_000_000;

export const sampleHash = Buffer.alloc(32, 1).toString("hex");
export const samplePrevHash = Buffer.alloc(32, 2).toString("hex");

export const rootResponseFixture = {
  horizon_version: "2.30.0",
  core_version: "20.1.0",
  history_latest_ledger: sampleSequence,
  history_latest_ledger_closed_at: "2026-08-20T10:15:00Z",
  history_elder_ledger: 49_000_000,
  core_latest_ledger: sampleSequence,
  network_passphrase: "Test SDF Network ; September 2015",
  current_protocol_version: 21,
  supported_protocol_version: 21,
  core_supported_protocol_version: 21
};

export const ledgerRecordFixture = {
  _links: { self: { href: `https://horizon-testnet.stellar.org/ledgers/${sampleSequence}` } },
  id: sampleHash,
  paging_token: String(sampleSequence),
  hash: sampleHash,
  prev_hash: samplePrevHash,
  sequence: sampleSequence,
  successful_transaction_count: 125,
  failed_transaction_count: 3,
  operation_count: 450,
  tx_set_operation_count: 450,
  closed_at: "2026-08-20T10:15:00Z",
  total_coins: "105000000000.0000000",
  fee_pool: "12345.6789000",
  max_tx_set_size: 1000,
  protocol_version: 21,
  header_xdr: "AAAA...",
  base_fee_in_stroops: 100,
  base_reserve_in_stroops: 5_000_000
};
