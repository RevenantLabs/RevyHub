import { expect, it } from "vitest";
import { formatLedger, formatVerdict } from "../lib/format";
import type { HashReport } from "../types";

const report: HashReport = {
  contractId: "C",
  network: "testnet",
  instance: { kind: "wasm", hash: "aa", marker: { latestLedger: 400, lastModifiedLedgerSeq: 10, liveUntilLedgerSeq: null } },
  code: { size: 4, hash: "bb", marker: { latestLedger: 401, lastModifiedLedgerSeq: 20, liveUntilLedgerSeq: null } },
  verdict: "mismatch",
  atomic: false
};

it("prints an unknown marker and calls out a non-atomic snapshot", () => {
  expect(formatLedger(null)).toBe("unknown");
  expect(formatVerdict(report)).toBe("mismatch; not an atomic snapshot; instance 400");
});
