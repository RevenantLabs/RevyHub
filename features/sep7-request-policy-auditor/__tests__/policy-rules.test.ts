import { expect, it } from "vitest";
import { parsePolicy, toStroops } from "../lib/policy-rules";
import { brokenPolicyText, emptyDestinationPolicyText } from "../fixtures/policies.fixture";
import { samplePolicyText } from "../fixtures/sep7RequestPolicyAuditor.fixture";

it("accepts the sample policy and converts decimals to stroops", () => {
  const parsed = parsePolicy(samplePolicyText);
  expect(parsed.ok).toBe(true);
  expect(toStroops("10.5")).toBe(105_000_000n);
  expect(toStroops("1.0000000")).toBe(10_000_000n);
  expect(toStroops("0.0000001")).toBe(1n);
});

it("rejects broken JSON and an empty destination list", () => {
  expect(parsePolicy(brokenPolicyText)).toMatchObject({ ok: false, code: "invalid_policy" });
  expect(parsePolicy(emptyDestinationPolicyText).ok).toBe(false);
});
