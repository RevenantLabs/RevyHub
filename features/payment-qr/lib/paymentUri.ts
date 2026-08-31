import type { PaymentRequest } from "@/features/payment-qr/types";

/**
 * Builds a SEP-0007 `web+stellar:pay` URI.
 *
 * Parameter order follows the SEP so two identical requests always produce a
 * byte-identical URI, which keeps the generated QR stable and diffable.
 */
export function buildPaymentUri(request: PaymentRequest): string {
  const params = new URLSearchParams();
  params.set("destination", request.destination);
  params.set("amount", request.amount);

  if (request.asset.kind === "issued") {
    params.set("asset_code", request.asset.code);
    params.set("asset_issuer", request.asset.issuer);
  }

  if (request.memo) {
    params.set("memo", request.memo);
    params.set("memo_type", "MEMO_TEXT");
  }

  if (request.msg) params.set("msg", request.msg);

  return `web+stellar:pay?${params.toString()}`;
}

/** Parses a SEP-0007 pay URI back into its parameters, for round-trip checks. */
export function parsePaymentUri(uri: string): Record<string, string> | null {
  if (!uri.startsWith("web+stellar:pay?")) return null;
  return Object.fromEntries(new URLSearchParams(uri.slice("web+stellar:pay?".length)));
}
