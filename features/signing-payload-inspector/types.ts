import type { StellarNetwork } from "@/core/network/types";

export interface SigningPayloadInspectorInput { envelope: string }
export type SigningPayloadInspectorErrorCode = "empty_xdr" | "invalid_xdr" | "unsupported_envelope" | "too_large";
export interface SigningPayload {
  /** Protocol envelope tag: 2 for classic, 5 for fee bump. */
  tag: "classic" | "fee-bump";
  signatureBaseHex: string;
  payloadHashHex: string;
  byteLength: number;
}
export interface SigningPayloadInspectorResult {
  network: StellarNetwork;
  networkIdHex: string;
  variant: "classic-v0" | "classic-v1" | "fee-bump";
  outer: SigningPayload;
  inner: SigningPayload | null;
}
export type SigningPayloadInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SigningPayloadInspectorResult }
  | { status: "error"; code: SigningPayloadInspectorErrorCode };
