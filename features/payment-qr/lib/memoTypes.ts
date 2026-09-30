export type PaymentMemoType = "text" | "id" | "hash" | "return";

export const PAYMENT_MEMO_TYPES: readonly PaymentMemoType[] = ["text", "id", "hash", "return"];

export const PAYMENT_MEMO_TYPE_URI_VALUES: Record<PaymentMemoType, string> = {
  text: "MEMO_TEXT",
  id: "MEMO_ID",
  hash: "MEMO_HASH",
  return: "MEMO_RETURN"
};

export const PAYMENT_MEMO_TYPE_GUIDANCE: Record<PaymentMemoType, string> = {
  text: "Use up to 28 bytes for invoices, order IDs, or short notes.",
  id: "Use a whole number from 0 to 18446744073709551615.",
  hash: "Use exactly 64 hexadecimal characters for a 32-byte hash.",
  return: "Use exactly 64 hexadecimal characters for a 32-byte return hash."
};

export const MEMO_PLACEHOLDERS: Record<PaymentMemoType, string> = {
  text: "Invoice 1001",
  id: "9223372036854775807",
  hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  return: "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"
};

const MAX_UINT64 = BigInt("18446744073709551615");

export function normalizePaymentMemo(memoType: PaymentMemoType, memo: string): string {
  const value = memo.trim();

  if (!value) {
    throw new Error("Enter a memo value for the selected memo type.");
  }

  switch (memoType) {
    case "text":
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
