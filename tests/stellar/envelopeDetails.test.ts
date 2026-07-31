import { describe, expect, it } from "vitest";
import { formatFee } from "@/components/stellar/EnvelopeDetails";

describe("formatFee", () => {
  it("formats stroops without losing integer precision", () => {
    expect(formatFee("100")).toBe("100 stroops (0.0000100 XLM)");
    expect(formatFee("9223372036854775807")).toBe(
      "9223372036854775807 stroops (922337203685.4775807 XLM)"
    );
  });

  it("preserves malformed values instead of showing a misleading amount", () => {
    expect(formatFee("not-a-fee")).toBe("not-a-fee stroops");
  });
});
