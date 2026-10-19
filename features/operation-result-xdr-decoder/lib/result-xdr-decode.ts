import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { unwrapFeeBump } from "./fee-bump-unwrap";
import type { DecodedResult, OperationResultXdrDecoderErrorCode } from "../types";

const snake = (name: string) => name.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/** Decode SDK XDR locally. The operation type comes from the XDR inner arm when present. */
export function decodeTransactionResultXdr(raw: unknown): Result<DecodedResult, OperationResultXdrDecoderErrorCode> {
  if (typeof raw !== "string" || !raw || raw.length > 262144 || !BASE64.test(raw)) return err("malformed_result_xdr");
  try {
    const result = xdr.TransactionResult.fromXDR(raw, "base64");
    const unwrapped = unwrapFeeBump(result);
    if (!unwrapped.ok) return unwrapped;
    const operations = unwrapped.value.results.map((item, index) => {
      const outerCode = snake(item.switch().name);
      if (outerCode !== "op_inner") return { index, type: "", code: outerCode, outerCode };
      const arm = item.value() as xdr.OperationResultTr;
      const type = snake(arm.switch().name);
      const nested = arm.value() as { switch(): { name: string } };
      if (!nested || typeof nested.switch !== "function") throw new Error("unsupported result arm");
      return { index, type, code: snake(nested.switch().name), outerCode };
    });
    return ok({ outerCode: unwrapped.value.outerCode, transactionCode: unwrapped.value.transactionCode, feeCharged: result.feeCharged().toString(), innerFeeCharged: unwrapped.value.innerFeeCharged, feeBump: unwrapped.value.feeBump, operations });
  } catch { return err("malformed_result_xdr"); }
}
