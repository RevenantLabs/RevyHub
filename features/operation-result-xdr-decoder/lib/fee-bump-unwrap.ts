import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { OperationResultXdrDecoderErrorCode } from "../types";

export interface UnwrappedResult { outerCode: string; transactionCode: string; results: xdr.OperationResult[]; innerFeeCharged: string | null; feeBump: boolean }
const snake = (name: string) => name.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");

export function unwrapFeeBump(result: xdr.TransactionResult): Result<UnwrappedResult, OperationResultXdrDecoderErrorCode> {
  try {
    const outer = result.result();
    const outerCode = snake(outer.switch().name);
    if (outerCode === "tx_fee_bump_inner_success" || outerCode === "tx_fee_bump_inner_failed") {
      const inner = outer.innerResultPair().result();
      const transactionCode = snake(inner.result().switch().name);
      return ok({ outerCode, transactionCode, results: transactionCode === "tx_success" || transactionCode === "tx_failed" ? inner.result().results() : [], innerFeeCharged: inner.feeCharged().toString(), feeBump: true });
    }
    return ok({ outerCode, transactionCode: outerCode, results: outerCode === "tx_success" || outerCode === "tx_failed" ? outer.results() : [], innerFeeCharged: null, feeBump: false });
  } catch { return err("malformed_result_xdr"); }
}
