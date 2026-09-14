import { describe, expect, it } from "vitest";
import { runSorobanAuthInspector } from "@/features/soroban-auth-inspector/lib/sorobanAuthInspector";
import {
  buildAuthTreeEnvelopeXdr,
  buildNoAuthEnvelopeXdr,
  buildPaymentEnvelopeXdr,
  contractId,
  nestedContractId,
  sourceAccountId
} from "@/features/soroban-auth-inspector/fixtures/sorobanAuthInspector.fixture";

describe("runSorobanAuthInspector", () => {
  it("decodes an envelope with nested authorization entries", () => {
    const result = runSorobanAuthInspector({ xdr: buildAuthTreeEnvelopeXdr() });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("auth");
    if (result.value.kind !== "auth") return;

    expect(result.value.entries).toHaveLength(1);
    const entry = result.value.entries[0];

    expect(entry.credentials.kind).toBe("address");
    if (entry.credentials.kind !== "address") return;
    expect(entry.credentials.accountId).toBe(sourceAccountId);
    expect(entry.credentials.nonce).toBe("123456789");
    expect(entry.credentials.signatureExpirationLedger).toBe(2_000_000);

    expect(entry.rootInvocation.contractId).toBe(contractId);
    expect(entry.rootInvocation.functionName).toBe("transfer");
    expect(entry.rootInvocation.args).toHaveLength(2);
    expect(entry.rootInvocation.subInvocations).toHaveLength(1);

    const nested = entry.rootInvocation.subInvocations[0];
    expect(nested.contractId).toBe(nestedContractId);
    expect(nested.functionName).toBe("nested_transfer");
  });

  it("returns a no_authorization result for an envelope without auth entries", () => {
    const result = runSorobanAuthInspector({ xdr: buildNoAuthEnvelopeXdr() });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("no_authorization");
  });

  it("rejects a classic payment envelope", () => {
    const result = runSorobanAuthInspector({ xdr: buildPaymentEnvelopeXdr() });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("not_soroban");
  });

  it("rejects invalid base64", () => {
    const result = runSorobanAuthInspector({ xdr: "!!!not-base64!!!" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_xdr");
  });

  it("rejects valid base64 that is not an envelope", () => {
    const result = runSorobanAuthInspector({ xdr: Buffer.from("hello world").toString("base64") });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_xdr");
  });
});
