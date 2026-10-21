export interface LedgerHeaderDecoderInput { xdr: string }
export type LedgerHeaderDecoderErrorCode = "empty_xdr" | "invalid_xdr" | "malformed_header" | "too_large";
export interface UpgradeSummary {
  type: "protocol_version" | "base_fee" | "max_tx_set_size" | "base_reserve" | "flags" | "unrecognized";
  value: string | null;
  rawHex: string;
  typeNumber: number;
}
export interface ScpValueSummary { txSetHash: string; closeTime: string; upgrades: UpgradeSummary[] }
export interface LedgerHeaderDecoderResult {
  protocolVersion: string;
  ledgerSequence: string;
  baseFee: string;
  baseReserve: string;
  scpValue: ScpValueSummary;
}
export type LedgerHeaderDecoderState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: LedgerHeaderDecoderResult }
  | { status: "error"; code: LedgerHeaderDecoderErrorCode };
