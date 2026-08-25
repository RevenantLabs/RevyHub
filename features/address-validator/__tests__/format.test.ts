import { describe, expect, it } from "vitest";
import { formatKind, formatLength } from "@/features/address-validator/lib/format";
import { isBlocking, shouldRedact } from "@/features/address-validator/lib/addressValidator.errors";

describe("formatKind", () => {
  it("gives every kind a human-readable label", () => {
    expect(formatKind("ed25519_public_key")).toMatch(/public key/i);
    expect(formatKind("contract")).toMatch(/contract/i);
    expect(formatKind("unknown")).toMatch(/unrecognised/i);
  });
});

describe("formatLength", () => {
  it("pluralises correctly", () => {
    expect(formatLength(1)).toBe("1 character");
    expect(formatLength(56)).toBe("56 characters");
  });
});

describe("error helpers", () => {
  it("marks input problems as blocking", () => {
    expect(isBlocking("bad_checksum_or_length")).toBe(true);
    expect(isBlocking("unsupported_kind")).toBe(false);
  });

  it("redacts only secret seeds", () => {
    expect(shouldRedact("secret_seed_rejected")).toBe(true);
    expect(shouldRedact("bad_checksum_or_length")).toBe(false);
  });
});
