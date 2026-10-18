import type { HorizonLedgerRecord } from "@/features/ledger-close-cadence/types";

const base = Date.parse("2026-09-29T12:00:00.000Z");

/** Contiguous recent ledgers with ~5s closes — normal case. */
export const recentLedgersFixture: HorizonLedgerRecord[] = [
  { sequence: 1004, closed_at: new Date(base + 15_000).toISOString() },
  { sequence: 1003, closed_at: new Date(base + 10_000).toISOString() },
  { sequence: 1002, closed_at: new Date(base + 5_000).toISOString() },
  { sequence: 1001, closed_at: new Date(base).toISOString() }
];

export const ledgerCloseCadenceFixture = {
  _embedded: { records: recentLedgersFixture }
};

/** Same as recent, exported for edge-case naming required by the issue. */
export { recentLedgersFixture as recentLedgers };

/** Sample with a sequence gap and one unusually long interval. */
export const gapsFixtureRecords: HorizonLedgerRecord[] = [
  { sequence: 2010, closed_at: new Date(base + 40_000).toISOString() },
  { sequence: 2008, closed_at: new Date(base + 35_000).toISOString() },
  { sequence: 2007, closed_at: new Date(base + 5_000).toISOString() },
  { sequence: 2006, closed_at: new Date(base).toISOString() }
];

export const gapsFixture = {
  _embedded: { records: gapsFixtureRecords }
};

export const repeatedTimestampRecords: HorizonLedgerRecord[] = [
  { sequence: 3003, closed_at: new Date(base + 10_000).toISOString() },
  { sequence: 3002, closed_at: new Date(base + 5_000).toISOString() },
  { sequence: 3001, closed_at: new Date(base + 5_000).toISOString() },
  { sequence: 3000, closed_at: new Date(base).toISOString() }
];

export const malformedMixedRecords: HorizonLedgerRecord[] = [
  { sequence: 4002, closed_at: new Date(base + 5_000).toISOString() },
  { sequence: "not-a-number", closed_at: new Date(base).toISOString() },
  { sequence: 4001, closed_at: "yesterday" },
  { sequence: 4000, closed_at: new Date(base).toISOString() }
];

export const allMalformedRecords: HorizonLedgerRecord[] = [
  { sequence: "x", closed_at: "nope" },
  { closed_at: new Date(base).toISOString() },
  { sequence: 1 }
];
