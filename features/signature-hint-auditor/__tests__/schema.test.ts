import { describe, expect, it } from "vitest";
import {
  MAX_ENVELOPE_LENGTH,
  MAX_PUBLIC_SIGNERS,
  parsePublicSigners,
  parseSignatureHintAuditorInput
} from "@/features/signature-hint-auditor/schema";
import {
  notBase64,
  secretSeed,
  signedClassicXdr,
  source,
  extraSigner
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";

describe("parseSignatureHintAuditorInput", () => {
  it("rejects an empty envelope as empty_xdr", () => {
    expect(parseSignatureHintAuditorInput({ envelope: "  \n ", publicSigners: "" })).toEqual({
      ok: false,
      code: "empty_xdr"
    });
  });

  it("rejects text that is not base64 as invalid_xdr", () => {
    expect(
      parseSignatureHintAuditorInput({ envelope: notBase64, publicSigners: "" })
    ).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("rejects base64 whose length is not a multiple of four", () => {
    expect(parseSignatureHintAuditorInput({ envelope: "AAAAA", publicSigners: "" })).toEqual({
      ok: false,
      code: "invalid_xdr"
    });
  });

  it("refuses a secret seed in the envelope field and tags it for redaction", () => {
    const result = parseSignatureHintAuditorInput({
      envelope: secretSeed,
      publicSigners: ""
    });

    expect(result).toEqual({ ok: false, code: "invalid_xdr", detail: "secret_key" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("accepts an envelope with no public signers", () => {
    const result = parseSignatureHintAuditorInput({
      envelope: signedClassicXdr,
      publicSigners: "  "
    });

    expect(result.ok && result.value).toEqual({
      envelope: signedClassicXdr,
      publicSigners: []
    });
  });

  it("strips whitespace from a wrapped envelope paste", () => {
    const wrapped = `${signedClassicXdr.slice(0, 40)}\n  ${signedClassicXdr.slice(40)}`;
    const result = parseSignatureHintAuditorInput({
      envelope: wrapped,
      publicSigners: ""
    });

    expect(result.ok && result.value.envelope).toBe(signedClassicXdr);
  });

  it("rejects an envelope past the length cap", () => {
    const pastCap = "A".repeat(MAX_ENVELOPE_LENGTH + 4);
    expect(parseSignatureHintAuditorInput({ envelope: pastCap, publicSigners: "" })).toEqual({
      ok: false,
      code: "invalid_xdr"
    });
  });

  it("accepts public keys separated by newlines and commas", () => {
    const result = parseSignatureHintAuditorInput({
      envelope: signedClassicXdr,
      publicSigners: `${source.publicKey()},\n${extraSigner.publicKey()}`
    });

    expect(result.ok && result.value.publicSigners).toEqual([
      source.publicKey(),
      extraSigner.publicKey()
    ]);
  });
});

describe("parsePublicSigners", () => {
  it("rejects a secret seed as invalid_public_signer with redaction", () => {
    expect(parsePublicSigners(secretSeed)).toEqual({
      ok: false,
      code: "invalid_public_signer",
      detail: "secret_key"
    });
  });

  it("rejects a malformed public key", () => {
    expect(parsePublicSigners("GNOTAKEY")).toEqual({
      ok: false,
      code: "invalid_public_signer"
    });
  });

  it("rejects more than the documented signer cap", () => {
    const keys = Array.from({ length: MAX_PUBLIC_SIGNERS + 1 }, () => source.publicKey());
    expect(parsePublicSigners(keys.join("\n"))).toEqual({
      ok: false,
      code: "too_many_signers"
    });
  });

  it("accepts exactly the documented signer cap", () => {
    const keys = Array.from({ length: MAX_PUBLIC_SIGNERS }, () => source.publicKey());
    expect(parsePublicSigners(keys.join("\n")).ok).toBe(true);
  });
});
