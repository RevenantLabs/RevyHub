import { err, ok, type Result } from "@/core/result/result";
import { toTxrepConverterErrorCode } from "@/features/txrep-converter/lib/txrepConverter.errors";
import { xdrToTxrep } from "@/features/txrep-converter/lib/txrep-tree";
import type { TxrepConverterErrorCode } from "@/features/txrep-converter/types";

export function convertXdrToTxrep(raw: string): Result<string, TxrepConverterErrorCode> {
  try {
    return ok(xdrToTxrep(raw));
  } catch (error) {
    return err(toTxrepConverterErrorCode(error));
  }
}
