import { describe, expect, it } from "vitest";
import { verifyEd25519Signature } from "@/features/signature-verifier/lib/signatureVerifier";
import { signatureVerifierInput } from "@/features/signature-verifier/fixtures/signatureVerifier.fixture";

describe("runSignatureVerifier", () => {
  it("verifies a signature locally", () => {
    const result = verifyEd25519Signature(signatureVerifierInput);
    expect(result).toMatchObject({ ok: true, value: { verified: true, signatureBytes: 64 } });
  });

  it("reports a valid key with a non-matching signature as not verified", () => {
    const result = verifyEd25519Signature({ ...signatureVerifierInput, signature: "00".repeat(64) });
    expect(result).toMatchObject({ ok: true, value: { verified: false } });
  });
});
