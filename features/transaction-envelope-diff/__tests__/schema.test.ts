import { describe, expect, it } from "vitest";
import {
  MAX_ENVELOPE_LENGTH,
  MAX_PASSPHRASE_LENGTH,
  parseDiffInput,
  sideFor
} from "@/features/transaction-envelope-diff/schema";
import {
  PASSPHRASE,
  baseXdr,
  changedAmountXdr,
  notBase64,
  secretSeed,
  whitespaceXdr
} from "@/features/transaction-envelope-diff/fixtures/envelopeDiff.fixture";

const base = { left: baseXdr, right: changedAmountXdr, networkPassphrase: PASSPHRASE };

describe("parseDiffInput", () => {
  it("requires both envelopes and a passphrase", () => {
    expect(parseDiffInput({ ...base, left: "" })).toEqual({ ok: false, code: "empty_input" });
    expect(parseDiffInput({ ...base, right: "  " })).toEqual({ ok: false, code: "empty_input" });
    expect(parseDiffInput({ ...base, networkPassphrase: " " })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("attributes a malformed envelope to the side it came from", () => {
    expect(parseDiffInput({ ...base, left: notBase64 })).toEqual({
      ok: false,
      code: "invalid_left_xdr"
    });
    expect(parseDiffInput({ ...base, right: notBase64 })).toEqual({
      ok: false,
      code: "invalid_right_xdr"
    });
  });

  it("checks the before envelope first when both are wrong", () => {
    // A reviewer usually has exactly one side wrong; naming the first one
    // gives them something to fix rather than "one of these is invalid".
    expect(parseDiffInput({ left: notBase64, right: notBase64, networkPassphrase: PASSPHRASE }))
      .toEqual({ ok: false, code: "invalid_left_xdr" });
  });

  it("refuses a secret seed on either side without echoing it", () => {
    const left = parseDiffInput({ ...base, left: secretSeed });
    const right = parseDiffInput({ ...base, right: secretSeed });

    expect(left).toEqual({ ok: false, code: "invalid_input" });
    expect(right).toEqual({ ok: false, code: "invalid_input" });
    expect(JSON.stringify([left, right])).not.toContain(secretSeed);
  });

  it("strips whitespace from both sides", () => {
    const result = parseDiffInput({ ...base, right: whitespaceXdr });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.right).toBe(baseXdr);
  });

  it("trims the passphrase", () => {
    const result = parseDiffInput({ ...base, networkPassphrase: `  ${PASSPHRASE}  ` });
    expect(result.ok && result.value.networkPassphrase).toBe(PASSPHRASE);
  });

  it("accepts an envelope exactly at the cap and rejects one past it", () => {
    expect(parseDiffInput({ ...base, left: "A".repeat(MAX_ENVELOPE_LENGTH) }).ok).toBe(true);
    expect(parseDiffInput({ ...base, left: "A".repeat(MAX_ENVELOPE_LENGTH + 4) })).toEqual({
      ok: false,
      code: "input_too_large"
    });
  });

  it("rejects an oversized passphrase", () => {
    expect(
      parseDiffInput({ ...base, networkPassphrase: "x".repeat(MAX_PASSPHRASE_LENGTH + 1) })
    ).toEqual({ ok: false, code: "input_too_large" });
  });

  it("accepts two well-formed envelopes", () => {
    expect(parseDiffInput(base).ok).toBe(true);
  });
});

describe("sideFor", () => {
  it("routes each side-specific code to its field", () => {
    expect(sideFor("invalid_left_xdr")).toBe("left");
    expect(sideFor("invalid_right_xdr")).toBe("right");
    expect(sideFor("empty_input")).toBeNull();
  });
});
