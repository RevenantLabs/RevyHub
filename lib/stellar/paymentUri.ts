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

export interface ParsedPaymentUri {
  destination: string;
  amount: string;
  asset: "XLM" | "ISSUED";
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
  memoType?: string;
  networkPassphrase?: string;
}

const networkPassphrases: Record<StellarNetwork, string> = {
  testnet: Networks.TESTNET,
  mainnet: Networks.PUBLIC
};

const SUPPORTED_MEMO_TYPES = new Set(["MEMO_TEXT", "MEMO_ID", "MEMO_HASH", "MEMO_RETURN"]);

const CRITICAL_PARAMS = new Set([
  "destination", "amount", "asset_code", "asset_issuer", "memo", "memo_type", "network_passphrase"
]);

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

  if (input.memo && new TextEncoder().encode(input.memo).length > 28) {
    errors.memo = "Memo text must be 28 UTF-8 bytes or less for a Stellar text memo.";
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

export function parsePaymentUri(uri: string): ParsedPaymentUri {
  if (!uri.startsWith("web+stellar:")) {
    throw new Error("URI must start with web+stellar:");
  }

  if (uri.startsWith("web+stellar://")) {
    throw new Error("URI must use web+stellar:pay (not web+stellar://pay)");
  }

  const withoutScheme = uri.slice("web+stellar:".length);
  const qIndex = withoutScheme.indexOf("?");
  const action = qIndex === -1 ? withoutScheme : withoutScheme.slice(0, qIndex);

  if (action !== "pay") {
    throw new Error(`Unsupported action "${action}". Only "pay" is supported.`);
  }

  if (qIndex === -1) {
    throw new Error("Payment URI must contain query parameters.");
  }

  const queryString = withoutScheme.slice(qIndex + 1);

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(queryString);
  } catch {
    throw new Error("Failed to parse URI query string.");
  }

  CRITICAL_PARAMS.forEach((key) => {
    const values = params.getAll(key);
    if (values.length > 1) {
      throw new Error(`Duplicate parameter "${key}" found in URI.`);
    }
  });

  const getParam = (key: string): string | null => {
    const value = params.get(key);
    if (value === null) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      throw new Error(`Malformed encoding in parameter "${key}".`);
    }
  };

  const destination = getParam("destination");
  if (!destination) {
    throw new Error("URI must contain a destination parameter.");
  }
  const destValidation = validatePublicKey(destination);
  if (!destValidation.valid) {
    throw new Error(`Invalid destination: ${destValidation.message}`);
  }

  const amount = getParam("amount");
  if (!amount) {
    throw new Error("URI must contain an amount parameter.");
  }
  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  const assetCode = getParam("asset_code");
  const assetIssuer = getParam("asset_issuer");

  let asset: "XLM" | "ISSUED";
  if (assetCode && assetIssuer) {
    validateAssetCode(assetCode);
    const issuerValidation = validatePublicKey(assetIssuer);
    if (!issuerValidation.valid) {
      throw new Error(`Invalid asset issuer: ${issuerValidation.message}`);
    }
    asset = "ISSUED";
  } else if (assetCode || assetIssuer) {
    throw new Error("Issued asset requires both asset_code and asset_issuer.");
  } else {
    asset = "XLM";
  }

  const memo = getParam("memo") ?? undefined;
  const memoType = getParam("memo_type") ?? undefined;

  if (memoType && !SUPPORTED_MEMO_TYPES.has(memoType)) {
    throw new Error(`Unsupported memo_type "${memoType}". Must be one of: MEMO_TEXT, MEMO_ID, MEMO_HASH, MEMO_RETURN`);
  }

  const networkPassphrase = getParam("network_passphrase") ?? undefined;

  const result: ParsedPaymentUri = {
    destination,
    amount,
    asset,
    memo,
    memoType,
    networkPassphrase,
  };

  if (asset === "ISSUED") {
    result.assetCode = assetCode ?? undefined;
    result.assetIssuer = assetIssuer ?? undefined;
  }

  return result;
}
