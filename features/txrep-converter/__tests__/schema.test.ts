import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseTxrepConverterInput } from "@/features/txrep-converter/schema";
import { MAX_INPUT_LENGTH } from "@/features/txrep-converter/lib/format-detect";

describe("parseTxrepConverterInput", () => {
  it("accepts pasted text", () => {
    expect(parseTxrepConverterInput("  type: ENVELOPE_TYPE_TX  ")).toEqual({
      ok: true,
      value: { value: "type: ENVELOPE_TYPE_TX" }
    });
  });

  it("rejects an empty paste", () => {
    expect(parseTxrepConverterInput("  ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects oversized input and a secret seed", () => {
    expect(parseTxrepConverterInput("A".repeat(MAX_INPUT_LENGTH + 1))).toEqual({
      ok: false,
      code: "too_large"
    });
    const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).secret();
    expect(parseTxrepConverterInput(secret)).toEqual({ ok: false, code: "invalid_xdr" });
  });
});
