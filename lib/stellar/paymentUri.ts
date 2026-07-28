import { validatePublicKey } from "@/lib/stellar/validateAddress";

export interface PaymentRequestInput {
  destination: string;
  amount: string;
  asset: "XLM" | "ISSUED";
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
}

/**
 * Validates a Stellar payment amount as a decimal string without floating-point
 * conversion, then returns a canonical representation.
 *
 * Accepted format:  one or more digits, optionally followed by a dot and one to
 * seven digits (e.g. "10", "10.5", "0.0000001").
 *
 * Rules:
 *  - Must match /^\d+(\.\d+)?$/ — rejects signs, scientific notation (e/E),
 *    Infinity, NaN, and any embedded whitespace.
 *  - More than seven fractional digits are rejected outright; silent truncation
 *    would hide precision loss from callers.
 *  - The value must be strictly positive (not zero in any canonical form).
 *  - The canonical output strips unnecessary leading zeros from the integer part
 *    and unnecessary trailing zeros from the fractional part
 *    (e.g. "007.50000" → "7.5", "1.0000000" → "1").
 *
 * @throws {Error} with a descriptive message when validation fails.
 * @returns The canonical decimal string to embed in the payment URI.
 */
export function validateStellarAmount(raw: string): string {
  const trimmed = raw.trim();

  // Only allow unsigned decimal notation — no signs, no exponents, no specials.
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(
      "Amount must be a positive decimal number (e.g. 10 or 10.5). " +
        "Scientific notation, signs, and whitespace are not allowed."
    );
  }

  const [intPart, fracPart] = trimmed.split(".");

  // Stellar supports up to 7 decimal places (1 stroop = 0.0000001 XLM).
  if (fracPart !== undefined && fracPart.length > 7) {
    throw new Error(
      "Amount must not have more than 7 fractional digits (Stellar stroop precision)."
    );
  }

  // Strip leading zeros from the integer part (keep at least one digit).
  const canonicalInt = intPart.replace(/^0+/, "") || "0";

  // Strip trailing zeros from the fractional part; drop the dot if empty.
  const canonicalFrac =
    fracPart !== undefined ? fracPart.replace(/0+$/, "") : "";

  const canonical =
    canonicalFrac.length > 0
      ? `${canonicalInt}.${canonicalFrac}`
      : canonicalInt;

  // Reject zero in any form (e.g. "0", "0.0", "000.000").
  if (canonical === "0") {
    throw new Error("Enter a positive payment amount.");
  }

  return canonical;
}

export function validateAssetCode(value: string) {
  const assetCode = value.trim().toUpperCase();

  if (!assetCode) {
    throw new Error("Enter an issued asset code.");
  }

  if (!/^[a-zA-Z0-9]{1,12}$/.test(assetCode)) {
    throw new Error("Asset codes must be 1 to 12 letters or numbers.");
  }

  return assetCode;
}

export function createPaymentUri(input: PaymentRequestInput) {
  // TODO(issue #11): Extract full form validation into a reusable schema with field-level errors.
  // TODO(issue #12): Align this URI builder with a documented Stellar payment URI format and network/asset metadata.
  const validation = validatePublicKey(input.destination);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  // Decimal-safe validation — no floating-point conversion.
  const canonicalAmount = validateStellarAmount(input.amount);

  if (input.memo && input.memo.length > 28) {
    throw new Error("Memo text should be 28 characters or less for a simple Stellar text memo.");
  }

  const params = new URLSearchParams({
    destination: input.destination.trim(),
    amount: canonicalAmount
  });

  if (input.asset === "ISSUED") {
    const assetCode = validateAssetCode(input.assetCode ?? "");
    const issuerValidation = validatePublicKey(input.assetIssuer ?? "");

    if (!issuerValidation.valid) {
      throw new Error(`Asset issuer: ${issuerValidation.message}`);
    }

    params.set("asset_code", assetCode);
    params.set("asset_issuer", input.assetIssuer?.trim() ?? "");
  } else {
    params.set("asset_code", "XLM");
  }

  if (input.memo?.trim()) {
    params.set("memo", input.memo.trim());
  }

  return `web+stellar:pay?${params.toString()}`;
}
