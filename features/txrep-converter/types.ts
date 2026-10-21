import type { DetectedFormat } from "@/features/txrep-converter/lib/format-detect";

export interface TxrepConverterInput {
  value: string;
}

export interface TxrepConverterResult {
  detected: DetectedFormat;
  output: string;
  outputFormat: DetectedFormat;
  fieldCount: number;
  roundTripMatched: boolean;
}

export type TxrepConverterErrorCode =
  | "empty_input"
  | "invalid_xdr"
  | "invalid_txrep"
  | "unsupported_envelope"
  | "too_large";
