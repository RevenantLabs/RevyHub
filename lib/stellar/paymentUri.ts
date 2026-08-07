import { Networks } from "@stellar/stellar-sdk";
import type { StellarNetwork } from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";

export type PaymentMemoType = "text" | "id" | "hash" | "return";

export const PAYMENT_MEMO_TYPES: readonly PaymentMemoType[] = ["text", "id", "hash", "return"];

export const PAYMENT_MEMO_TYPE_URI_VALUES: Record<PaymentMemoType, string> = {
  text: "MEMO_TEXT",
  id: "MEMO_ID",
  hash: "MEMO_HASH",
  return: "MEMO_RETURN"
};

export const PAYMENT_MEMO_TYPE_GUIDANCE: Record<PaymentMemoType, string> = {
  text: "Use up to 28 UTF-8 bytes for invoices, order IDs, or short notes.",
  id: "Use a whole number from 0 to 18446744073709551615.",
  hash: "Use exactly 64 hexadecimal characters for a 32-byte hash.",
  return: "Use exactly 64 hexadecimal characters for a 32-byte return hash."
};

export interface PaymentRequestInput {
  destination: string;
  amount: string;
  asset: "XLM" | "ISSUED";
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
  memoType?: PaymentMemoType;
  network?: StellarNetwork;
}

const networkPassphrases: Record<StellarNetwork, string> = {
  testnet: Networks.TESTNET,
  mainnet: Networks.PUBLIC
};

const MAX_UINT64 = BigInt("18446744073709551615");

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

export function validatePaymentMemo(memoType: PaymentMemoType, memo: string) {
  const value = memo.trim();

  if (!value) {
    throw new Error("Enter a memo value for the selected memo type.");
  }

  switch (memoType) {
    case "text":
      if (new TextEncoder().encode(value).length > 28) {
        throw new Error("Memo text must be 28 UTF-8 bytes or less for a Stellar text memo.");
      }
      return value;
    case "id": {
      if (!/^\d+$/.test(value)) {
        throw new Error("Memo ID must be a whole number from 0 to 18446744073709551615.");
      }

      const memoId = BigInt(value);

      // Use BigInt(0) instead of the 0n literal so the build target stays broad.
      if (memoId < BigInt(0) || memoId > MAX_UINT64) {
        throw new Error("Memo ID must be a whole number from 0 to 18446744073709551615.");
      }

      return value;
    }
    case "hash":
    case "return": {
      if (!/^[0-9a-fA-F]{64}$/.test(value)) {
        throw new Error(
          memoType === "hash"
            ? "Memo hash must be exactly 64 hexadecimal characters."
            : "Memo return value must be exactly 64 hexadecimal characters."
        );
      }

      return value.toLowerCase();
    }
    default:
      throw new Error("Choose a supported memo type.");
  }
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

  if (input.memo && input.memo.trim()) {
    try {
      validatePaymentMemo(input.memoType ?? "text", input.memo);
    } catch (error) {
      errors.memo = (error as Error).message;
    }
  }

  return errors;
}

export function createPaymentUri(input: PaymentRequestInput) {
  // TODO(issue #12): Align this URI builder with a documented Stellar payment URI format and network/asset metadata.
  // TODO(issue #17): Add validation tests for destination, amount precision, memo length, and custom asset cases.
  const validation = validatePaymentForm(input);

  const firstError = Object.values(validation)[0];
  if (firstError) {
    throw new Error(firstError);
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
    const memoType = input.memoType ?? "text";
    const validatedMemo = validatePaymentMemo(memoType, input.memo);

    params.set("memo", validatedMemo);
    params.set("memo_type", PAYMENT_MEMO_TYPE_URI_VALUES[memoType]);
  }

  const network = input.network ?? "testnet";

  if (network !== "mainnet") {
    params.set("network_passphrase", networkPassphrases[network]);
  }

  return `web+stellar:pay?${params.toString()}`;
}
