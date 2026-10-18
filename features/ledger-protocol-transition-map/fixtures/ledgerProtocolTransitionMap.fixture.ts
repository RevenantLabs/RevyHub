import type { HorizonProtocolLedger } from "@/features/ledger-protocol-transition-map/types";

const base = Date.parse("2026-09-29T12:00:00.000Z");

/** Contiguous ledgers with a single exact protocol upgrade. */
export const protocolLedgersFixture: HorizonProtocolLedger[] = [
  { sequence: 1000, protocol_version: 20, closed_at: new Date(base).toISOString(), paging_token: "1000" },
  { sequence: 1001, protocol_version: 20, closed_at: new Date(base + 5_000).toISOString(), paging_token: "1001" },
  { sequence: 1002, protocol_version: 21, closed_at: new Date(base + 10_000).toISOString(), paging_token: "1002" },
  { sequence: 1003, protocol_version: 21, closed_at: new Date(base + 15_000).toISOString(), paging_token: "1003" }
];

export const ledgerProtocolTransitionMapFixture = {
  _embedded: { records: protocolLedgersFixture }
};

/** Same data under the edge-case fixture filename required by the issue. */
export { protocolLedgersFixture as protocolLedgers };

/** Missing ledger between protocol versions — uncertain boundary. */
export const missingLedgersFixtureRecords: HorizonProtocolLedger[] = [
  { sequence: 2000, protocol_version: 19, closed_at: new Date(base).toISOString(), paging_token: "2000" },
  { sequence: 2002, protocol_version: 20, closed_at: new Date(base + 10_000).toISOString(), paging_token: "2002" },
  { sequence: 2003, protocol_version: 20, closed_at: new Date(base + 15_000).toISOString(), paging_token: "2003" }
];

export const missingLedgersFixture = {
  _embedded: { records: missingLedgersFixtureRecords }
};

export const malformedProtocolRecords: HorizonProtocolLedger[] = [
  { sequence: "x", protocol_version: 20 },
  { sequence: 1, protocol_version: "nope" },
  { closed_at: new Date(base).toISOString() }
];
