import { err, ok, type Result } from "@/core/result/result";
import { copy } from "../copy";
import type { DecodedOperation, OperationResultRow, OperationResultXdrDecoderErrorCode } from "../types";
import { explainCode } from "./format";

export function pairOperationResults(results: DecodedOperation[], types: string[]): Result<OperationResultRow[], OperationResultXdrDecoderErrorCode> {
  if (results.length !== types.length || results.some((row, i) => !types[i] || (row.type && row.type !== types[i]))) return err("unsupported_operation");
  return ok(results.map((row, index) => ({ index, type: types[index], outerCode: row.outerCode, result: explainCode(row.code, row.type || types[index]) })));
}
export const pairingNote = copy.unknownType;
