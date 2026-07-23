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
  text: "Use up to 28 characters for invoices, order IDs, or short notes.",
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
}

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
      if (value.length > 28) {
        throw new Error("Memo text should be 28 characters or less for a Stellar text memo.");
      }
      return value;
    case "id": {
      if (!/^\d+$/.test(value)) {
        throw new Error("Memo ID must be a whole number from 0 to 18446744073709551615.");
      }

      const memoId = BigInt(value);

      if (memoId < 0n || memoId > MAX_UINT64) {
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

export function createPaymentUri(input: PaymentRequestInput) {
  // TODO(issue #11): Extract full form validation into a reusable schema with field-level errors.
  // TODO(issue #12): Align this URI builder with a documented Stellar payment URI format and network/asset metadata.
  // TODO(issue #17): Add validation tests for destination, amount precision, memo length, and custom asset cases.
  const validation = validatePublicKey(input.destination);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a positive payment amount.");
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
  } else {
    params.set("asset_code", "XLM");
  }

  if (input.memo?.trim()) {
    const memoType = input.memoType ?? "text";
    const validatedMemo = validatePaymentMemo(memoType, input.memo);

    params.set("memo", validatedMemo);

    if (memoType !== "text") {
      params.set("memo_type", PAYMENT_MEMO_TYPE_URI_VALUES[memoType]);
    }
  }

  return `web+stellar:pay?${params.toString()}`;
}
