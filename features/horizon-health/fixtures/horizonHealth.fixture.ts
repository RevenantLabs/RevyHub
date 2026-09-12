export const healthyHorizonTestnet = {
  horizon_version: "28.0.1-a70eb47f76985d372de3e59f4d75c7f8542752f7",
  core_version: "stellar-core 28.0.1 (947aad8413c189d85504acf72207e85eeda9b021)",
  ingest_latest_ledger: 4634661,
  history_latest_ledger: 4634661,
  history_latest_ledger_closed_at: "2026-09-12T07:08:12Z",
  history_elder_ledger: 128,
  core_latest_ledger: 4634661,
  network_passphrase: "Test SDF Network ; September 2015",
  current_protocol_version: 28,
  supported_protocol_version: 28,
  core_supported_protocol_version: 28
};

export const healthyHorizonMainnet = {
  horizon_version: "28.0.0-f827361a9",
  core_version: "stellar-core 28.0.0 (7481b)",
  ingest_latest_ledger: 56000000,
  history_latest_ledger: 56000000,
  history_latest_ledger_closed_at: "2026-09-12T07:08:10Z",
  history_elder_ledger: 1,
  core_latest_ledger: 56000000,
  network_passphrase: "Public Global Stellar Network ; September 2015",
  current_protocol_version: 28,
  supported_protocol_version: 28,
  core_supported_protocol_version: 28
};

export const degradedHorizonTestnet = {
  ...healthyHorizonTestnet,
  ingest_latest_ledger: 4634650,
  history_latest_ledger: 4634650,
  core_latest_ledger: 4634661
};

export const malformedHorizonResponse = {
  service: "unknown",
  status: "ok"
};
