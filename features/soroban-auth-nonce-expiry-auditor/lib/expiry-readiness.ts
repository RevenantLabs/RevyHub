import type { ExpiryStatus } from "../types";
/** Soroban accepts the expiration ledger itself; it expires when current > expiration. */
export function classifyExpiry(expirationLedger: number, evaluationLedger: number | null): ExpiryStatus {
  if (!Number.isInteger(expirationLedger) || expirationLedger < 0 || expirationLedger > 0xffffffff) throw new RangeError("Invalid expiration ledger");
  if (evaluationLedger === null) return "unknown";
  if (!Number.isInteger(evaluationLedger) || evaluationLedger < 0 || evaluationLedger > 0xffffffff) throw new RangeError("Invalid evaluation ledger");
  return evaluationLedger <= expirationLedger ? "ready" : "expired";
}
