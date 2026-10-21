import { describe, expect, it } from "vitest";
import { convertTxrepToXdr } from "@/features/txrep-converter/lib/txrep-to-xdr";
import { convertXdrToTxrep } from "@/features/txrep-converter/lib/xdr-to-txrep";
import { malformedTxrep, missingTypeTxrep } from "@/features/txrep-converter/fixtures/malformed-txrep.fixture";
import { sampleEnvelope } from "@/features/txrep-converter/fixtures/sample-envelope.fixture";

describe("convertTxrepToXdr", () => {
  it("compiles Txrep back to the original envelope bytes", () => {
    const txrep = convertXdrToTxrep(sampleEnvelope);
    expect(txrep.ok).toBe(true);
    if (!txrep.ok) return;
    const back = convertTxrepToXdr(txrep.value);
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    expect(Buffer.from(back.value, "base64").equals(Buffer.from(sampleEnvelope, "base64"))).toBe(true);
  });

  it("rejects a missing type and a mistyped fee", () => {
    expect(convertTxrepToXdr(missingTypeTxrep)).toEqual({ ok: false, code: "invalid_txrep" });
    expect(convertTxrepToXdr(malformedTxrep)).toEqual({ ok: false, code: "invalid_txrep" });
  });
});
