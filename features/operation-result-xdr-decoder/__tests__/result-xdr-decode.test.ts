import { describe, expect, it } from "vitest";
import { decodeTransactionResultXdr as decode } from "../lib/result-xdr-decode";
import { successXdr } from "../fixtures/operationResultXdrDecoder.fixture";
import { partialXdr, preOperationXdr } from "../fixtures/partial-failure.fixture";
import { xdr } from "@stellar/stellar-sdk";
describe("result XDR", () => {
  it("decodes successful operation arm", () => expect(decode(successXdr)).toMatchObject({ ok: true, value: { transactionCode: "tx_success", operations: [{ type: "bump_sequence", code: "bump_sequence_success" }] } }));
  it("decodes each operation in a failed transaction", () => expect(decode(partialXdr)).toMatchObject({ ok: true, value: { transactionCode: "tx_failed", operations: [{ code: "bump_sequence_success" }, { code: "payment_underfunded" }] } }));
  it("keeps pre-operation failures empty", () => expect(decode(preOperationXdr)).toMatchObject({ ok: true, value: { transactionCode: "tx_bad_seq", operations: [] } }));
  it("preserves a generic operation wrapper failure for pairing with Horizon's type", () => {
    const result = new xdr.TransactionResult({
      feeCharged: xdr.Int64.fromString("100"),
      result: xdr.TransactionResultResult.txFailed([xdr.OperationResult.opBadAuth()]),
      ext: new (xdr.TransactionResultExt as unknown as new (v: 0) => xdr.TransactionResultExt)(0)
    });
    expect(decode(result.toXDR("base64"))).toMatchObject({ ok: true, value: { operations: [{ type: "", code: "op_bad_auth" }] } });
  });
  it.each([undefined, "bad!!!", "A".repeat(262148)])("rejects missing, malformed or excessive data", (raw) => expect(decode(raw)).toEqual({ ok: false, code: "malformed_result_xdr" }));
});
