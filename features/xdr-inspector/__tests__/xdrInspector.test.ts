import { describe, expect, it } from "vitest";
import { inspectEnvelope } from "@/features/xdr-inspector/lib/xdrInspector";
import { parseXdrInput } from "@/features/xdr-inspector/schema";
import {
  destination,
  expiredXdr,
  feeBumpXdr,
  feeSource,
  notAnEnvelopeXdr,
  paymentXdr,
  signedPaymentXdr,
  source,
  unboundedXdr
} from "@/features/xdr-inspector/fixtures/xdrInspector.fixture";

function inspect(xdrString: string) {
  const parsed = parseXdrInput(xdrString);
  if (!parsed.ok) throw new Error(`fixture failed to parse: ${parsed.code}`);
  return inspectEnvelope(parsed.value);
}

describe("inspectEnvelope", () => {
  it("summarises a v1 payment envelope", () => {
    const result = inspect(paymentXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      variant: "classic-v1",
      sourceAccount: source.publicKey(),
      fee: "200",
      memo: { type: "text", value: "Invoice 1001" },
      signatureCount: 0,
      feeBump: null
    });
  });

  it("lists every operation in order", () => {
    const result = inspect(paymentXdr);
    expect(result.ok && result.value.operationTypes).toEqual(["payment", "bumpSequence"]);
  });

  it("counts signatures without verifying them", () => {
    const result = inspect(signedPaymentXdr);
    expect(result.ok && result.value.signatureCount).toBe(1);
  });

  it("reports time bounds when present", () => {
    const result = inspect(paymentXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.preconditions.timeBounds).toEqual({
      minTime: "1700000000",
      maxTime: "1900000000"
    });
  });

  it("reports an envelope with no time bounds", () => {
    const result = inspect(unboundedXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.preconditions.timeBounds).toEqual({ minTime: "0", maxTime: "0" });
  });

  it("unwraps a fee bump and describes the inner transaction", () => {
    const result = inspect(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.variant).toBe("fee-bump");
    // The summary describes the inner transaction that will actually execute.
    expect(result.value.sourceAccount).toBe(source.publicKey());
    expect(result.value.operationTypes).toEqual(["payment", "bumpSequence"]);
    expect(result.value.feeBump).toMatchObject({ feeSource: feeSource.publicKey() });
  });

  it("keeps the destination out of the summary — only the source is reported", () => {
    const result = inspect(paymentXdr);
    expect(result.ok && result.value.sourceAccount).not.toBe(destination.publicKey());
  });

  it("rejects valid base64 that is not a transaction envelope", () => {
    expect(inspect(notAnEnvelopeXdr)).toEqual({ ok: false, code: "malformed_envelope" });
  });

  it("reports an expired envelope as a normal result, not an error", () => {
    const result = inspect(expiredXdr);
    expect(result.ok).toBe(true);
  });
});
