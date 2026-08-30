import { describe, expect, it } from "vitest";
import {
  decodeAccountDataValue,
  formatByteLength,
  formatDecodedAccountDataValue
} from "@/features/account-data-entries/lib/format";
import {
  binaryBase64,
  brokenBase64,
  textBase64
} from "@/features/account-data-entries/fixtures/accountDataEntries.fixture";

describe("formatByteLength", () => {
  it("formats singular and plural byte counts", () => {
    expect(formatByteLength(1)).toBe("1 byte");
    expect(formatByteLength(8)).toBe("8 bytes");
  });
});

describe("decodeAccountDataValue", () => {
  it("decodes printable UTF-8 as text", () => {
    const value = decodeAccountDataValue(textBase64);

    expect(value).toEqual({ kind: "text", text: "verified", byteLength: 8 });
    expect(formatDecodedAccountDataValue(value)).toBe("verified");
  });

  it("keeps raw bytes as hex", () => {
    const value = decodeAccountDataValue(binaryBase64);

    expect(value).toEqual({ kind: "bytes", hex: "00ff10", byteLength: 3 });
    expect(formatDecodedAccountDataValue(value)).toBe("0x00ff10");
  });

  it("reports malformed base64", () => {
    const value = decodeAccountDataValue(brokenBase64);

    expect(value).toEqual({ kind: "invalid_base64" });
    expect(formatDecodedAccountDataValue(value)).toBe("Invalid base64");
  });
});
