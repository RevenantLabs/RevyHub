import { expect, it } from "vitest";
import { auditRequest } from "../lib/sep7RequestPolicyAuditor";
import { sample } from "../fixtures/sep7RequestPolicyAuditor.fixture";
import { blockedCallbackUri, malformedUri, txOperationUri } from "../fixtures/payment-uris.fixture";
import { brokenPolicyText } from "../fixtures/policies.fixture";

it("accepts the sample and still returns verdicts when a callback host is blocked", () => {
  const okResult = auditRequest(sample.uri, sample.policy);
  expect(okResult.ok && okResult.value.verdicts.every((item) => item.passed)).toBe(true);
  const blocked = auditRequest(blockedCallbackUri, sample.policy);
  expect(blocked.ok && blocked.value.verdicts.find((item) => item.field === "callback")?.passed).toBe(false);
});

it("returns parse and policy errors before any verdict", () => {
  expect(auditRequest(malformedUri, sample.policy)).toMatchObject({ ok: false, code: "invalid_uri" });
  expect(auditRequest(txOperationUri, sample.policy)).toMatchObject({ ok: false, code: "unsupported_operation" });
  expect(auditRequest(sample.uri, brokenPolicyText)).toMatchObject({ ok: false, code: "invalid_policy" });
});
