export type PaymentAsset =
  | { kind: "native" }
  | { kind: "issued"; code: string; issuer: string };

export interface PaymentRequest {
  destination: string;
  amount: string;
  asset: PaymentAsset;
  memo?: string;
  /** Free-text label shown by the wallet, from SEP-0007. */
  msg?: string;
}

export interface PaymentUriResult {
  uri: string;
  /** Inline SVG markup for the QR code. */
  svg: string;
}

export type PaymentQrErrorCode =
  | "empty_destination"
  | "invalid_destination"
  | "empty_amount"
  | "invalid_amount"
  | "amount_too_precise"
  | "empty_asset_code"
  | "invalid_asset_code"
  | "invalid_asset_issuer"
  | "memo_too_long"
  | "message_too_long"
  | "qr_generation_failed";

export type PaymentQrField =
  | "destination"
  | "amount"
  | "assetCode"
  | "assetIssuer"
  | "memo"
  | "msg";
