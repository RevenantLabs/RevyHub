import { describe, expect, it } from "vitest";
import {
  MAX_ENVELOPE_LENGTH,
  MAX_PASSPHRASE_LENGTH,
  MAX_SNAPSHOT_LENGTH,
  parseSignerRotationInput
} from "@/features/signer-rotation-impact-auditor/schema";
import {
  normalSnapshot,
  notBase64,
  PASSPHRASE,
  safeRotationXdr,
  secretSeed
} from "@/features/signer-rotation-impact-auditor/fixtures/normal.fixture";
import {
  oversizedEnvelope,
  oversizedSnapshot
} from "@/features/signer-rotation-impact-auditor/fixtures/boundary.fixture";

describe("parseSignerRotationInput", () => {
  it("accepts a trimmed snapshot and whitespace-stripped envelope", () => {
    const result = parseSignerRotationInput({
      accountSnapshot: `  ${normalSnapshot}  `,
      envelopeXdr: `  ${safeRotationXdr.slice(0, 20)}\n${safeRotationXdr.slice(20)}  `,
      networkPassphrase: ` ${PASSPHRASE} `
    });

    expect(result).toEqual({
      ok: true,
      value: {
        accountSnapshot: normalSnapshot,
        envelopeXdr: safeRotationXdr,
        networkPassphrase: PASSPHRASE
      }
    });
  });

  it("rejects empty fields", () => {
    expect(
      parseSignerRotationInput({
        accountSnapshot: "",
        envelopeXdr: safeRotationXdr,
        networkPassphrase: PASSPHRASE
      }).ok
    ).toBe(false);
    expect(
      parseSignerRotationInput({
        accountSnapshot: normalSnapshot,
        envelopeXdr: "",
        networkPassphrase: PASSPHRASE
      })
    ).toMatchObject({ ok: false, code: "empty_input" });
  });

  it("refuses a secret seed anywhere in the paste", () => {
    expect(
      parseSignerRotationInput({
        accountSnapshot: secretSeed,
        envelopeXdr: safeRotationXdr,
        networkPassphrase: PASSPHRASE
      })
    ).toEqual({ ok: false, code: "invalid_input" });

    expect(
      parseSignerRotationInput({
        accountSnapshot: normalSnapshot,
        envelopeXdr: secretSeed,
        networkPassphrase: PASSPHRASE
      })
    ).toEqual({ ok: false, code: "invalid_input" });
  });

  it("rejects non-base64 envelopes as malformed", () => {
    expect(
      parseSignerRotationInput({
        accountSnapshot: normalSnapshot,
        envelopeXdr: notBase64,
        networkPassphrase: PASSPHRASE
      })
    ).toEqual({ ok: false, code: "malformed_data" });
  });

  it("rejects oversized input", () => {
    expect(oversizedSnapshot.length).toBeGreaterThan(MAX_SNAPSHOT_LENGTH);
    expect(oversizedEnvelope.length).toBeGreaterThan(MAX_ENVELOPE_LENGTH);

    expect(
      parseSignerRotationInput({
        accountSnapshot: oversizedSnapshot,
        envelopeXdr: safeRotationXdr,
        networkPassphrase: PASSPHRASE
      })
    ).toEqual({ ok: false, code: "too_large" });

    expect(
      parseSignerRotationInput({
        accountSnapshot: normalSnapshot,
        envelopeXdr: oversizedEnvelope,
        networkPassphrase: PASSPHRASE
      })
    ).toEqual({ ok: false, code: "too_large" });

    expect(
      parseSignerRotationInput({
        accountSnapshot: normalSnapshot,
        envelopeXdr: safeRotationXdr,
        networkPassphrase: "x".repeat(MAX_PASSPHRASE_LENGTH + 1)
      })
    ).toEqual({ ok: false, code: "too_large" });
  });
});
