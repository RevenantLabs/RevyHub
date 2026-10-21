import { err, ok, type Result } from "@/core/result/result";
import { toTxrepConverterErrorCode } from "@/features/txrep-converter/lib/txrepConverter.errors";
import { txrepToXdr } from "@/features/txrep-converter/lib/txrep-tree";
import type { TxrepConverterErrorCode } from "@/features/txrep-converter/types";

export function convertTxrepToXdr(raw: string): Result<string, TxrepConverterErrorCode> {
  try {
    return ok(txrepToXdr(raw));
  } catch (error) {
    const code = toTxrepConverterErrorCode(error);
    return err(code === "invalid_xdr" ? "invalid_txrep" : code);
  }
}
