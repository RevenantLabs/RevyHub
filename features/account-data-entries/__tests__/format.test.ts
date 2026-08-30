import { describe, expect, it } from "vitest";
import { decodeDataEntry } from "../lib/format";
import { Buffer } from "buffer";

describe("decodeDataEntry", () => {
  it("decodes printable ascii text correctly", () => {
    const base64 = Buffer.from("hello world", "utf8").toString("base64");
    const decoded = decodeDataEntry(base64);
    expect(decoded.displayType).toBe("text");
    expect(decoded.decodedValue).toBe("hello world");
    expect(decoded.byteLength).toBe(11);
  });

  it("falls back to hex for non-printable control chars", () => {
    const base64 = Buffer.from("hello\x00world", "utf8").toString("base64");
    const decoded = decodeDataEntry(base64);
    expect(decoded.displayType).toBe("hex");
    expect(decoded.decodedValue).toBe(Buffer.from("hello\x00world", "utf8").toString("hex"));
  });

  it("allows standard whitespace", () => {
    const base64 = Buffer.from("hello\n\t\rworld", "utf8").toString("base64");
    const decoded = decodeDataEntry(base64);
    expect(decoded.displayType).toBe("text");
    expect(decoded.decodedValue).toBe("hello\n\t\rworld");
  });

  it("handles invalid base64 smoothly", () => {
    // Actually Buffer.from handles bad base64, but let's test a case
    const decoded = decodeDataEntry("!@#$");
    expect(decoded.displayType).toBe("hex");
  });
});
