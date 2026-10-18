import { describe, expect, it } from "vitest";
import {
  formatBase64,
  formatBytes,
  formatCharacters,
  formatHex,
  formatNameBudget,
  formatText,
  formatValueBudget,
  isMultibyte
} from "@/features/manage-data-codec/lib/format";
import {
  isLengthProblem,
  isNameProblem,
  isValueProblem,
  toManageDataErrorCode
} from "@/features/manage-data-codec/lib/manageDataCodec.errors";
import type { ByteView, NameView } from "@/features/manage-data-codec/types";

const name = (over: Partial<NameView> = {}): NameView => ({
  text: "abc",
  byteLength: 3,
  characterLength: 3,
  hex: "616263",
  ...over
});

const value = (over: Partial<ByteView> = {}): ByteView => ({
  byteLength: 3,
  hex: "010203",
  base64: "AQID",
  text: "abc",
  textLossless: true,
  hasControlBytes: false,
  ...over
});

describe("formatBytes and formatCharacters", () => {
  it("use the singular for exactly one", () => {
    expect(formatBytes(1)).toBe("1 byte");
    expect(formatCharacters(1)).toBe("1 character");
  });

  it("use the plural for zero and for many", () => {
    expect(formatBytes(0)).toBe("0 bytes");
    expect(formatCharacters(12)).toBe("12 characters");
  });
});

describe("budgets", () => {
  it("state the remaining room rather than implying it", () => {
    expect(formatNameBudget(name({ byteLength: 12 }))).toBe("12 of 64 bytes");
    expect(formatValueBudget(value({ byteLength: 64 }))).toBe("64 of 64 bytes");
  });
});

describe("isMultibyte", () => {
  it("is true only when bytes and characters disagree", () => {
    expect(isMultibyte(name())).toBe(false);
    expect(isMultibyte(name({ byteLength: 6, characterLength: 3 }))).toBe(true);
  });
});

describe("formatHex", () => {
  it("groups bytes in pairs so they can be counted", () => {
    expect(formatHex("0102ff")).toBe("01 02 ff");
  });

  it("says an empty value is empty rather than showing nothing", () => {
    expect(formatHex("")).toBe("(empty)");
  });
});

describe("formatBase64", () => {
  it("names the empty encoding explicitly", () => {
    expect(formatBase64("")).toBe("(empty)");
    expect(formatBase64("AQID")).toBe("AQID");
  });
});

describe("formatText", () => {
  it("returns null when the bytes are not valid UTF-8", () => {
    // The caller shows the hex notice instead of inventing characters.
    expect(formatText(value({ textLossless: false, text: null }))).toBeNull();
  });

  it("labels a zero-byte value rather than rendering an empty line", () => {
    expect(formatText(value({ byteLength: 0, text: "" }))).toBe("(empty)");
  });

  it("passes escaped text straight through", () => {
    expect(formatText(value({ text: "A\\u0000B", hasControlBytes: true }))).toBe("A\\u0000B");
  });
});

describe("error classification", () => {
  it("routes each code to the field responsible for it", () => {
    expect(isNameProblem("name_too_long")).toBe(true);
    expect(isNameProblem("empty_input")).toBe(true);
    expect(isNameProblem("value_too_long")).toBe(false);

    expect(isValueProblem("value_too_long")).toBe(true);
    expect(isValueProblem("invalid_encoding")).toBe(true);
    expect(isValueProblem("name_too_long")).toBe(false);
  });

  it("separates a bound being exceeded from input being unreadable", () => {
    expect(isLengthProblem("name_too_long")).toBe(true);
    expect(isLengthProblem("value_too_long")).toBe(true);
    // "Shorten it" is the wrong advice for text that is not that encoding.
    expect(isLengthProblem("invalid_encoding")).toBe(false);
  });

  it("maps anything unexpected to unusable input", () => {
    expect(toManageDataErrorCode(new Error("boom"))).toBe("invalid_input");
  });
});
