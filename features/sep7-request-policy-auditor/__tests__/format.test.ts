import { expect, it } from "vitest";
import { formatPolicy, formatReport } from "../lib/format";
import { auditRequest } from "../lib/sep7RequestPolicyAuditor";
import { sample } from "../fixtures/sep7RequestPolicyAuditor.fixture";

it("prints the range with an en dash and a stable verdict list", () => {
  expect(formatPolicy({ destinations: [], minAmount: "1", maxAmount: "25", passphrases: [], callbackHosts: [], assets: [], memos: [] })).toBe("1–25");
  const report = auditRequest(sample.uri, sample.policy);
  if (!report.ok) throw new Error(report.code);
  expect(formatReport(report.value)).toContain('"verdicts"');
});
