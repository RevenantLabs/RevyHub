import { copy } from "@/features/sep24-transaction-status-tracker/copy";
import type { Sep24Kind } from "@/features/sep24-transaction-status-tracker/types";

export function formatKind(kind: Sep24Kind): string {
  if (kind === "deposit") return "Deposit";
  if (kind === "withdrawal") return "Withdrawal";
  return "Unknown";
}

export function formatAmount(value: string | null): string {
  return value ?? copy.notProvided;
}
