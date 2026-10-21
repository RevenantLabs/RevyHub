import { describe, expect, it } from "vitest";
import { convertXdrToTxrep } from "@/features/txrep-converter/lib/xdr-to-txrep";
import { expectedPaths, sampleEnvelope } from "@/features/txrep-converter/fixtures/sample-envelope.fixture";

describe("convertXdrToTxrep", () => {
  it("prints SEP-0011 key paths for the sample envelope", () => {
    const result = convertXdrToTxrep(sampleEnvelope);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const line of expectedPaths) expect(result.value).toContain(line);
  });

  it("rejects malformed base64", () => {
    expect(convertXdrToTxrep("AAAA")).toEqual({ ok: false, code: "invalid_xdr" });
  });
});
