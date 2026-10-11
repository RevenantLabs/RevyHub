import { describe, expect, it } from "vitest";
import { parseMultisigAnalyzerInput } from "@/features/multisig-analyzer/schema";

describe("parseMultisigAnalyzerInput", () => {
  it("rejects empty xdr and empty account", () => {
    expect(parseMultisigAnalyzerInput({ envelope: "   ", sourceAccount: "   " })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("normalises the xdr and source account input", () => {
    const result = parseMultisigAnalyzerInput({ envelope: "  ABC  ", sourceAccount: "  GABC  " });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ envelope: "ABC", sourceAccount: "GABC" });
  });

  it("rejects secret seeds on prefix alone", () => {
    expect(parseMultisigAnalyzerInput({ envelope: "ABC", sourceAccount: "S123" })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });
});
