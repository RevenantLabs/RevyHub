import type { FederationMemoType, FederationRecord } from "@/features/federation-resolver/types";

const MEMO_TYPE_LABELS: Record<FederationMemoType, string> = {
  text: "Text",
  id: "ID",
  hash: "Hash",
  return: "Return hash"
};

export function formatMemoType(memoType: FederationMemoType | undefined): string {
  return memoType ? MEMO_TYPE_LABELS[memoType] : "None";
}

export function formatMemo(record: FederationRecord): string {
  if (!record.memo || !record.memoType) return "None";
  return `${record.memo} (${MEMO_TYPE_LABELS[record.memoType]})`;
}

/**
 * A memo returned by federation is not optional — it routes the payment to the
 * right customer at a shared account. Omitting it usually loses the funds.
 */
export function requiresMemo(record: FederationRecord): boolean {
  return Boolean(record.memo && record.memoType);
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
