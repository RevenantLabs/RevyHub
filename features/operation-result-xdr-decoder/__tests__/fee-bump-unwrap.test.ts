import { expect, it } from "vitest";
import { decodeTransactionResultXdr } from "../lib/result-xdr-decode";
import { feeBumpXdr } from "../fixtures/fee-bump-result.fixture";
it("shows the outer fee-bump code and inner payment failure separately", () => {
  expect(decodeTransactionResultXdr(feeBumpXdr)).toMatchObject({ ok: true, value: { feeBump: true, outerCode: "tx_fee_bump_inner_failed", transactionCode: "tx_failed", feeCharged: "500", innerFeeCharged: "100", operations: [{ type: "payment", code: "payment_underfunded" }] } });
});
