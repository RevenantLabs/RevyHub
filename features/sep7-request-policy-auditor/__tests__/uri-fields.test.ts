import { expect, it } from "vitest";
import { parseSep7Uri } from "../lib/uri-fields";
import { malformedUri, plusMemoUri, txOperationUri } from "../fixtures/payment-uris.fixture";
import { sampleUri } from "../fixtures/sep7RequestPolicyAuditor.fixture";

it("reads a pay request and keeps a plus sign in the memo", () => {
  const parsed = parseSep7Uri(sampleUri);
  expect(parsed.ok).toBe(true);
  if (!parsed.ok) return;
  expect(parsed.value.operation).toBe("pay");
  expect(parsed.value.amount).toBe("10.5");
  const plus = parseSep7Uri(plusMemoUri);
  expect(plus.ok && plus.value.memo).toBe("hello+world");
});

it("rejects a non-uri and a transaction operation", () => {
  expect(parseSep7Uri(malformedUri)).toMatchObject({ ok: false, code: "invalid_uri" });
  expect(parseSep7Uri(txOperationUri)).toMatchObject({ ok: false, code: "unsupported_operation" });
  expect(!parseSep7Uri("web+stellar:pay?destination=SABC").ok).toBe(true);
});
