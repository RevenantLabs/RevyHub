import { describe, expect, it } from "vitest";
import { deriveSignerHint, deriveSignerHints } from "@/features/signature-hint-auditor/lib/signer-hints";
import {
  extraSigner,
  extraSignerHint,
  secretSeed,
  source,
  sourceHint
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";

describe("deriveSignerHint", () => {
  it("derives the last four bytes of the public key as hex", () => {
    expect(deriveSignerHint(source.publicKey())).toEqual({
      ok: true,
      value: { publicKey: source.publicKey(), hint: sourceHint }
    });
  });

  it("rejects a secret seed", () => {
    expect(deriveSignerHint(secretSeed)).toEqual({
      ok: false,
      code: "invalid_public_signer"
    });
  });

  it("rejects a non-key string", () => {
    expect(deriveSignerHint("not-a-key")).toEqual({
      ok: false,
      code: "invalid_public_signer"
    });
  });
});

describe("deriveSignerHints", () => {
  it("preserves paste order across multiple keys", () => {
    const result = deriveSignerHints([extraSigner.publicKey(), source.publicKey()]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((entry) => entry.hint)).toEqual([extraSignerHint, sourceHint]);
  });

  it("fails closed on the first invalid key", () => {
    expect(deriveSignerHints([source.publicKey(), "GBAD"])).toEqual({
      ok: false,
      code: "invalid_public_signer"
    });
  });

  it("accepts an empty list", () => {
    expect(deriveSignerHints([])).toEqual({ ok: true, value: [] });
  });
});
