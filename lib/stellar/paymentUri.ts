import { Networks } from "@stellar/stellar-sdk";
import type { StellarNetwork } from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";

export interface PaymentRequestInput {
  destination: string;
  amount: string;
  asset: "XLM" | "ISSUED";
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
  network?: StellarNetwork;
}

const networkPassphrases: Record<StellarNetwork, string> = {
  testnet: Networks.TESTNET,
  mainnet: Networks.PUBLIC
};

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
  // TODO(issue #17): Add validation tests for destination, amount precision, memo length, and custom asset cases.
  const validation = validatePublicKey(input.destination);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a positive payment amount.");
  }

  if (input.memo && input.memo.length > 28) {
    throw new Error("Memo text should be 28 characters or less for a simple Stellar text memo.");
  }

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
  }

  if (input.memo?.trim()) {
    params.set("memo", input.memo.trim());
    params.set("memo_type", "MEMO_TEXT");
  }

  const network = input.network ?? "testnet";

  if (network !== "mainnet") {
    params.set("network_passphrase", networkPassphrases[network]);
  }

  return `web+stellar:pay?${params.toString()}`;
}
