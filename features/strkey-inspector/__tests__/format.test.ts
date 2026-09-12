import { describe, expect, it } from "vitest";
import {
  formatByteLength,
  formatHex,
  formatKind
} from "@/features/strkey-inspector/lib/format";
import { kindLabels } from "@/features/strkey-inspector/copy";

describe("formatKind", () => {
  it("formats ed25519_public_key kind label", () => {
    expect(formatKind("ed25519_public_key")).toBe(
      kindLabels.ed25519_public_key
    );
  });

  it("formats muxed_account kind label", () => {
    expect(formatKind("muxed_account")).toBe(kindLabels.muxed_account);
  });

  it("formats contract kind label", () => {
    expect(formatKind("contract")).toBe(kindLabels.contract);
  });

  it("formats pre_auth_tx kind label", () => {
    expect(formatKind("pre_auth_tx")).toBe(kindLabels.pre_auth_tx);
  });

  it("formats sha256_hash kind label", () => {
    expect(formatKind("sha256_hash")).toBe(kindLabels.sha256_hash);
  });

  it("formats signed_payload kind label", () => {
    expect(formatKind("signed_payload")).toBe(kindLabels.signed_payload);
  });
});

describe("formatByteLength", () => {
  it("formats singular byte count", () => {
    expect(formatByteLength(1)).toBe("1 byte");
  });

  it("formats plural byte count", () => {
    expect(formatByteLength(32)).toBe("32 bytes");
  });
});

describe("formatHex", () => {
  it("converts uppercase hex to lowercase", () => {
    expect(formatHex("A1B2C3D4")).toBe("a1b2c3d4");
  });
});
