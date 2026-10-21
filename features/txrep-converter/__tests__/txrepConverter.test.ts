import { describe, expect, it } from "vitest";
import { runTxrepConverter } from "@/features/txrep-converter/lib/txrepConverter";
import { sampleEnvelope } from "@/features/txrep-converter/fixtures/sample-envelope.fixture";
import { missingTypeTxrep } from "@/features/txrep-converter/fixtures/malformed-txrep.fixture";

describe("runTxrepConverter", () => {
  it("converts XDR to Txrep and confirms the round trip", () => {
    const result = runTxrepConverter({ value: sampleEnvelope });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.detected).toBe("xdr");
    expect(result.value.outputFormat).toBe("txrep");
    expect(result.value.roundTripMatched).toBe(true);
    expect(result.value.output).toContain("type: ENVELOPE_TYPE_TX");
  });

  it("converts that Txrep back to XDR", () => {
    const first = runTxrepConverter({ value: sampleEnvelope });
    if (!first.ok) throw new Error("setup");
    const result = runTxrepConverter({ value: first.value.output });
    expect(result.ok && result.value.detected).toBe("txrep");
    expect(result.ok && result.value.roundTripMatched).toBe(true);
  });

  it("rejects unrecognized text and a Txrep document with no type", () => {
    expect(runTxrepConverter({ value: "not an envelope" })).toEqual({ ok: false, code: "invalid_xdr" });
    expect(runTxrepConverter({ value: missingTypeTxrep })).toEqual({ ok: false, code: "invalid_txrep" });
  });
});
