import { describe, expect, it } from "vitest";
import { detectFormat } from "@/features/txrep-converter/lib/format-detect";
import { sampleEnvelope } from "@/features/txrep-converter/fixtures/sample-envelope.fixture";

describe("detectFormat", () => {
  it("detects base64 XDR", () => {
    expect(detectFormat(sampleEnvelope)).toBe("xdr");
  });

  it("detects Txrep field lines", () => {
    expect(detectFormat("type: ENVELOPE_TYPE_TX\ntx.fee: 100\n")).toBe("txrep");
  });

  it("returns null for blank or unrecognized text", () => {
    expect(detectFormat("   ")).toBeNull();
    expect(detectFormat("hello")).toBeNull();
  });
});
