import { validatePublicKey } from "@/lib/stellar/validateAddress";

export interface PaymentRequestInput {
  destination: string;
  amount: string;
  asset: "XLM" | "ISSUED";
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
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

export function validatePaymentForm(input: PaymentRequestInput): Record<string, string> {
  const errors: Record<string, string> = {};

  const destValidation = validatePublicKey(input.destination);
  if (!destValidation.valid) {
    errors.destination = destValidation.message;
  }

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter a positive payment amount.";
  }

  if (input.asset !== "XLM" && input.asset !== "ISSUED") {
    errors.asset = "Select an asset type.";
  }

  if (input.asset === "ISSUED") {
    const code = (input.assetCode ?? "").trim();
    if (!code) {
      errors.assetCode = "Enter an issued asset code.";
    } else if (!/^[a-zA-Z0-9]{1,12}$/.test(code)) {
      errors.assetCode = "Asset codes must be 1 to 12 letters or numbers.";
    }

    const issuerValidation = validatePublicKey(input.assetIssuer ?? "");
    if (!issuerValidation.valid) {
      errors.assetIssuer = `Asset issuer: ${issuerValidation.message}`;
    }
  }

  if (input.memo && input.memo.length > 28) {
    errors.memo = "Memo text should be 28 characters or less for a simple Stellar text memo.";
  }

  return errors;
}

export function createPaymentUri(input: PaymentRequestInput) {
  const validation = validatePaymentForm(input);

  const firstError = Object.values(validation)[0];
  if (firstError) {
    throw new Error(firstError);
  }

  // TODO(issue #12): Align this URI builder with a documented Stellar payment URI format and network/asset metadata.
  // TODO(issue #17): Add validation tests for destination, amount precision, memo length, and custom asset cases.
  const params = new URLSearchParams({
    destination: input.destination.trim(),
    amount: input.amount.trim()
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
