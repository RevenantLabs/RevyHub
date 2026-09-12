import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatEncoding,
  formatPassphrasePreset
} from "@/features/hash-calculator/lib/format";

describe("formatBytes", () => {
  it("formats singular byte correctly", () => {
    expect(formatBytes(1)).toBe("1 byte");
  });

  it("formats multiple bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 bytes");
    expect(formatBytes(32)).toBe("32 bytes");
    expect(formatBytes(1024)).toBe("1024 bytes");
  });
});

describe("formatEncoding", () => {
  it("formats encoding labels", () => {
    expect(formatEncoding("utf8")).toBe("UTF-8");
    expect(formatEncoding("hex")).toBe("Hexadecimal");
    expect(formatEncoding("base64")).toBe("Base64");
  });
});

describe("formatPassphrasePreset", () => {
  it("formats network preset labels", () => {
    expect(formatPassphrasePreset("testnet")).toBe("Testnet");
    expect(formatPassphrasePreset("public")).toBe("Mainnet / Public");
    expect(formatPassphrasePreset("custom")).toBe("Custom Network");
  });
});
