import { describe, expect, it } from "vitest";
import { formatWeight, signerRowKey } from "@/features/account-signers/lib/format";

describe("formatWeight", () => {
  it("groups an integer weight without using floating-point arithmetic", () => {
    expect(formatWeight("9007199254740993")).toBe("9,007,199,254,740,993");
  });

  it("preserves zero", () => {
    expect(formatWeight("0")).toBe("0");
  });
});

describe("signerRowKey", () => {
  it("keeps identical key text distinct across signer types", () => {
    expect(signerRowKey("same-key", "sha256_hash")).not.toBe(
      signerRowKey("same-key", "preauth_tx")
    );
  });
});
