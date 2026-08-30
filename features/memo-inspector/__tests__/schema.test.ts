import { describe, expect, it } from "vitest";
import { toHex } from "@/features/memo-inspector/lib/bytes";
import {
  FIELD_OF_CODE,
  isMemoKind,
  parseHashBytes,
  parseMemoForm,
  parseMemoId,
  requiresValue
} from "@/features/memo-inspector/schema";
import {
  hashBase64,
  hashBase64Url,
  hashBytes,
  hashForm,
  hashHex,
  idForm,
  maxMemoId,
  noneForm,
  overMaxMemoId,
  returnForm,
  secretKey,
  shortHashHex,
  textAtByteLimit,
  textEmojiAtByteLimit,
  textForm,
  textOverByteLimit
} from "@/features/memo-inspector/fixtures/memoInspector.fixture";

describe("parseMemoForm", () => {
  it("accepts all five memo types", () => {
    expect(parseMemoForm(noneForm)).toEqual({ ok: true, value: { kind: "none" } });
    expect(parseMemoForm(textForm)).toMatchObject({ ok: true, value: { kind: "text" } });
    expect(parseMemoForm(idForm)).toMatchObject({ ok: true, value: { kind: "id" } });
    expect(parseMemoForm(hashForm)).toMatchObject({ ok: true, value: { kind: "hash" } });
    expect(parseMemoForm(returnForm)).toMatchObject({ ok: true, value: { kind: "return" } });
  });

  it("ignores any value typed for MEMO_NONE", () => {
    expect(parseMemoForm({ kind: "none", value: "ignored" })).toEqual({
      ok: true,
      value: { kind: "none" }
    });
  });

  it("rejects a memo type that is not one of the five", () => {
    expect(parseMemoForm({ kind: "envelope", value: "x" })).toEqual({
      ok: false,
      code: "unsupported_type"
    });
  });

  it.each(["text", "id", "hash", "return"])("requires a value for %s memos", (kind) => {
    expect(parseMemoForm({ kind, value: "   " })).toEqual({ ok: false, code: "empty_input" });
  });

  it("trims the outer whitespace of a text memo but keeps the inner spaces", () => {
    expect(parseMemoForm({ kind: "text", value: "  order 42\n" })).toMatchObject({
      ok: true,
      value: { text: "order 42" }
    });
  });

  it("maps every error code to the control that caused it", () => {
    expect(FIELD_OF_CODE.text_too_long).toBe("value");
    expect(FIELD_OF_CODE.invalid_id).toBe("value");
    expect(FIELD_OF_CODE.invalid_hash).toBe("value");
    expect(FIELD_OF_CODE.unsupported_type).toBe("kind");
    expect(FIELD_OF_CODE.decode_failed).toBeNull();
  });
});

describe("text memo byte limit", () => {
  it("accepts exactly 28 bytes", () => {
    expect(parseMemoForm({ kind: "text", value: textAtByteLimit }).ok).toBe(true);
  });

  it("rejects 29 bytes", () => {
    expect(parseMemoForm({ kind: "text", value: `${textAtByteLimit}a` })).toEqual({
      ok: false,
      code: "text_too_long"
    });
  });

  it("counts bytes rather than characters", () => {
    // Ten rocket emoji: ten characters, twenty UTF-16 code units, forty bytes.
    expect([...textOverByteLimit].length).toBe(10);
    expect(parseMemoForm({ kind: "text", value: textOverByteLimit })).toEqual({
      ok: false,
      code: "text_too_long"
    });

    // Seven rocket emoji are 28 bytes exactly, so they fit.
    expect(parseMemoForm({ kind: "text", value: textEmojiAtByteLimit }).ok).toBe(true);
  });
});

describe("parseMemoId", () => {
  it("accepts the boundaries of the unsigned 64-bit range", () => {
    expect(parseMemoId("0")).toEqual({ ok: true, value: 0n });
    expect(parseMemoId(maxMemoId)).toEqual({ ok: true, value: 2n ** 64n - 1n });
  });

  it("rejects one past the top of the range", () => {
    expect(parseMemoId(overMaxMemoId)).toEqual({ ok: false, code: "invalid_id" });
  });

  it("keeps precision above Number.MAX_SAFE_INTEGER", () => {
    const result = parseMemoId("9007199254740993");
    expect(result.ok && result.value).toBe(9007199254740993n);
  });

  it.each(["-1", "1.5", "1e3", "0x10", "1_000", "12 34", "abc", "+7"])(
    "rejects %s",
    (value) => {
      expect(parseMemoId(value)).toEqual({ ok: false, code: "invalid_id" });
    }
  );

  it("reports an empty id as empty rather than invalid", () => {
    expect(parseMemoId("")).toEqual({ ok: false, code: "empty_input" });
  });
});

describe("parseHashBytes", () => {
  it("accepts 64 hex characters", () => {
    expect(parseHashBytes(hashHex)).toEqual({
      ok: true,
      value: { hash: hashBytes, encoding: "hex" }
    });
  });

  it("accepts upper-case hex and whitespace from a wrapped paste", () => {
    const result = parseHashBytes(`${hashHex.toUpperCase().slice(0, 32)}\n${hashHex.slice(32)}`);
    expect(result.ok && toHex(result.value.hash)).toBe(hashHex);
  });

  it("accepts base64 that decodes to 32 bytes", () => {
    expect(parseHashBytes(hashBase64)).toEqual({
      ok: true,
      value: { hash: hashBytes, encoding: "base64" }
    });
  });

  it("accepts URL-safe base64 without padding", () => {
    expect(parseHashBytes(hashBase64Url)).toMatchObject({
      ok: true,
      value: { encoding: "base64" }
    });
  });

  it("prefers hex when a string could be read as either", () => {
    // 64 hex characters are also valid base64, but they decode to 48 bytes.
    expect(parseHashBytes(hashHex)).toMatchObject({ ok: true, value: { encoding: "hex" } });
  });

  it("rejects 31 bytes of hex", () => {
    expect(parseHashBytes(shortHashHex)).toEqual({ ok: false, code: "invalid_hash" });
  });

  it("rejects 33 bytes of hex", () => {
    expect(parseHashBytes(`${hashHex}ff`)).toEqual({ ok: false, code: "invalid_hash" });
  });

  it("rejects base64 that decodes to the wrong length", () => {
    // Not hex — `z` is outside the alphabet — so this can only be read as base64.
    expect(parseHashBytes("zzzz")).toEqual({ ok: false, code: "invalid_hash" });
  });

  it("reports an empty hash as empty rather than invalid", () => {
    expect(parseHashBytes("  ")).toEqual({ ok: false, code: "empty_input" });
  });
});

describe("secret keys", () => {
  it("cannot be carried by a text memo — a seed is 56 bytes and the limit is 28", () => {
    expect(parseMemoForm({ kind: "text", value: secretKey })).toEqual({
      ok: false,
      code: "text_too_long"
    });
  });

  it.each(["hash", "return"])("is rejected as a %s memo", (kind) => {
    expect(parseMemoForm({ kind, value: secretKey })).toEqual({
      ok: false,
      code: "invalid_hash"
    });
  });

  it("is rejected as a memo id", () => {
    expect(parseMemoForm({ kind: "id", value: secretKey })).toEqual({
      ok: false,
      code: "invalid_id"
    });
  });
});

describe("kind helpers", () => {
  it("recognises exactly the five memo kinds", () => {
    expect(["none", "text", "id", "hash", "return"].every(isMemoKind)).toBe(true);
    expect(isMemoKind("MEMO_TEXT")).toBe(false);
  });

  it("knows that only MEMO_NONE needs no value", () => {
    expect(requiresValue("none")).toBe(false);
    expect(requiresValue("text")).toBe(true);
  });
});
