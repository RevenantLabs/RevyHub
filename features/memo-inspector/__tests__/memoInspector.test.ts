import { Memo } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { concatBytes, toBase64, uint32Bytes } from "@/features/memo-inspector/lib/bytes";
import {
  decodeMemo,
  encodeMemo,
  inspectMemo,
  MEMO_TYPE_VALUES,
  TEXT_MAX_BYTES
} from "@/features/memo-inspector/lib/memoInspector";
import { parseMemoForm } from "@/features/memo-inspector/schema";
import type { MemoInput } from "@/features/memo-inspector/types";
import {
  hashForm,
  hashHex,
  idForm,
  noneForm,
  returnForm,
  textAtByteLimit,
  textForm,
  textWithoutPadding
} from "@/features/memo-inspector/fixtures/memoInspector.fixture";

/** The codec is hand-written, so every case is checked against the SDK's own. */
function sdkBase64(memo: Memo): string {
  return memo.toXDRObject().toXDR().toString("base64");
}

function input(raw: { kind: string; value: string }): MemoInput {
  const parsed = parseMemoForm(raw);
  if (!parsed.ok) throw new Error(`fixture did not parse: ${parsed.code}`);
  return parsed.value;
}

function encoded(raw: { kind: string; value: string }) {
  const result = encodeMemo(input(raw));
  if (!result.ok) throw new Error(`fixture did not encode: ${result.code}`);
  return result.value;
}

describe("encodeMemo", () => {
  it("matches the SDK for all five memo types", () => {
    expect(encoded(noneForm).xdrBase64).toBe(sdkBase64(Memo.none()));
    expect(encoded(textForm).xdrBase64).toBe(sdkBase64(Memo.text(textForm.value)));
    expect(encoded(idForm).xdrBase64).toBe(sdkBase64(Memo.id(idForm.value)));
    // Hex rather than a Buffer: the SDK types `Memo.return` as string-only,
    // and hex is the form both constructors accept.
    expect(encoded(hashForm).xdrBase64).toBe(sdkBase64(Memo.hash(hashHex)));
    expect(encoded(returnForm).xdrBase64).toBe(sdkBase64(Memo.return(hashHex)));
  });

  it("writes MEMO_NONE as a bare four-byte discriminant", () => {
    const result = encoded(noneForm);
    expect(result.xdrHex).toBe("00000000");
    expect(result.xdrByteLength).toBe(4);
    expect(result.payloadByteLength).toBe(0);
    expect(result.displayValue).toBeNull();
  });

  it("uses the XDR discriminant of each type", () => {
    expect(MEMO_TYPE_VALUES).toEqual({ none: 0, text: 1, id: 2, hash: 3, return: 4 });
    expect(encoded(textForm).typeValue).toBe(1);
    expect(encoded(returnForm).typeName).toBe("MEMO_RETURN");
  });

  it("splits a text memo into discriminant, length, value and padding", () => {
    const result = encoded({ kind: "text", value: "ab" });

    expect(result.segments.map((segment) => segment.part)).toEqual([
      "discriminant",
      "length",
      "value",
      "padding"
    ]);
    expect(result.segments.map((segment) => segment.hex)).toEqual([
      "00000001",
      "00000002",
      "6162",
      "0000"
    ]);
  });

  it("omits the padding segment when the text is already four-byte aligned", () => {
    const result = encoded({ kind: "text", value: textWithoutPadding });
    expect(result.segments.map((segment) => segment.part)).not.toContain("padding");
    // 4 discriminant + 4 length + 4 value, with nothing to round up.
    expect(result.xdrByteLength).toBe(12);
  });

  it("encodes a text memo at exactly the 28-byte limit", () => {
    const result = encoded({ kind: "text", value: textAtByteLimit });
    expect(result.payloadByteLength).toBe(TEXT_MAX_BYTES);
    expect(result.xdrBase64).toBe(sdkBase64(Memo.text(textAtByteLimit)));
  });

  it("encodes emoji by their bytes, not their characters", () => {
    const result = encoded({ kind: "text", value: "🚀" });
    expect(result.payloadByteLength).toBe(4);
    expect(result.segments.find((segment) => segment.part === "value")?.hex).toBe("f09f9a80");
  });

  it("writes a memo id as eight big-endian bytes via BigInt", () => {
    expect(encoded({ kind: "id", value: "0" }).xdrHex).toBe("000000020000000000000000");
    expect(encoded({ kind: "id", value: "18446744073709551615" }).xdrHex).toBe(
      "00000002ffffffffffffffff"
    );
  });

  it("keeps a hash memo at 32 bytes with no length prefix", () => {
    const result = encoded(hashForm);
    expect(result.payloadByteLength).toBe(32);
    expect(result.xdrByteLength).toBe(36);
    expect(result.segments.map((segment) => segment.part)).toEqual(["discriminant", "value"]);
  });

  it("reports an unknown memo type as a value instead of throwing", () => {
    const unknown = { kind: "envelope" } as unknown as MemoInput;
    expect(encodeMemo(unknown)).toEqual({ ok: false, code: "unsupported_type" });
  });
});

describe("decodeMemo", () => {
  it("round-trips every memo type", () => {
    expect(decodeMemo(encoded(noneForm).xdrBase64)).toEqual({
      ok: true,
      value: {
        kind: "none",
        typeName: "MEMO_NONE",
        value: null,
        payloadHex: null,
        payloadByteLength: 0
      }
    });

    expect(decodeMemo(encoded(textForm).xdrBase64)).toMatchObject({
      ok: true,
      value: { kind: "text", value: textForm.value }
    });
    expect(decodeMemo(encoded(idForm).xdrBase64)).toMatchObject({
      ok: true,
      value: { kind: "id", value: idForm.value }
    });
    expect(decodeMemo(encoded(hashForm).xdrBase64)).toMatchObject({
      ok: true,
      value: { kind: "hash", value: encoded(hashForm).displayValue }
    });
    expect(decodeMemo(encoded(returnForm).xdrBase64)).toMatchObject({
      ok: true,
      value: { kind: "return" }
    });
  });

  it("round-trips the full uint64 range without losing precision", () => {
    const result = decodeMemo(encoded({ kind: "id", value: "18446744073709551615" }).xdrBase64);
    expect(result).toMatchObject({ ok: true, value: { value: "18446744073709551615" } });
  });

  it("round-trips emoji text byte for byte", () => {
    const result = decodeMemo(encoded({ kind: "text", value: "🚀🚀" }).xdrBase64);
    expect(result).toMatchObject({ ok: true, value: { value: "🚀🚀", payloadByteLength: 8 } });
  });

  it("rejects input that is not base64 at all", () => {
    expect(decodeMemo("not base64!!")).toEqual({ ok: false, code: "decode_failed" });
  });

  it("rejects bytes too short to hold a discriminant", () => {
    expect(decodeMemo(toBase64(new Uint8Array([0, 0]))).ok).toBe(false);
  });

  it("reports an unrecognised discriminant as unsupported_type", () => {
    expect(decodeMemo(toBase64(uint32Bytes(9)))).toEqual({
      ok: false,
      code: "unsupported_type"
    });
  });

  it("rejects a MEMO_NONE that carries a body", () => {
    const bytes = concatBytes(uint32Bytes(0), new Uint8Array([1, 2, 3, 4]));
    expect(decodeMemo(toBase64(bytes))).toEqual({ ok: false, code: "decode_failed" });
  });

  it("rejects a truncated memo id", () => {
    const bytes = concatBytes(uint32Bytes(2), new Uint8Array(7));
    expect(decodeMemo(toBase64(bytes))).toEqual({ ok: false, code: "decode_failed" });
  });

  it("rejects a hash memo that is not 32 bytes", () => {
    const bytes = concatBytes(uint32Bytes(3), new Uint8Array(31));
    expect(decodeMemo(toBase64(bytes))).toEqual({ ok: false, code: "decode_failed" });
  });

  it("rejects a declared text length over the 28-byte limit", () => {
    const bytes = concatBytes(uint32Bytes(1), uint32Bytes(32), new Uint8Array(32));
    expect(decodeMemo(toBase64(bytes))).toEqual({ ok: false, code: "text_too_long" });
  });

  it("rejects a text memo whose padding does not add up", () => {
    const bytes = concatBytes(uint32Bytes(1), uint32Bytes(2), new Uint8Array([0x61, 0x62]));
    expect(decodeMemo(toBase64(bytes))).toEqual({ ok: false, code: "decode_failed" });
  });

  it("rejects text bytes that are not valid UTF-8", () => {
    const bytes = concatBytes(uint32Bytes(1), uint32Bytes(1), new Uint8Array([0xff, 0, 0, 0]));
    expect(decodeMemo(toBase64(bytes))).toEqual({ ok: false, code: "decode_failed" });
  });
});

describe("inspectMemo", () => {
  it("returns the encoding together with its decoded read-back", () => {
    const result = inspectMemo(input(textForm));
    expect(result.ok && result.value.decoded.value).toBe(textForm.value);
    expect(result.ok && result.value.encoding.xdrBase64).toBe(encoded(textForm).xdrBase64);
  });

  it("propagates a codec failure as a Result", () => {
    const unknown = { kind: "envelope" } as unknown as MemoInput;
    expect(inspectMemo(unknown)).toEqual({ ok: false, code: "unsupported_type" });
  });
});
