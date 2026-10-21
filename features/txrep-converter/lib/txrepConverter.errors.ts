import type { TxrepConverterErrorCode } from "@/features/txrep-converter/types";

export function toTxrepConverterErrorCode(error: unknown): TxrepConverterErrorCode {
  if (error instanceof Error && error.name === "UnsupportedEnvelopeError") return "unsupported_envelope";
  if (error instanceof Error && error.name === "TxrepReadError") return "invalid_txrep";
  return "invalid_xdr";
}
