import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { MonitorErrorCode, MonitorInput } from "@/features/horizon-rate-limit-monitor/types";

/** Validate locally before any request. Secret seeds are rejected on prefix alone. */
export function parseMonitorInput(accountRaw: string, thresholdRaw: string): Result<MonitorInput, MonitorErrorCode> {
  const accountId = accountRaw.trim();
  if (accountId.toUpperCase().startsWith("S")) return err("invalid_account");
  if (accountId && !StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_account");
  const threshold = thresholdRaw.trim();
  if (!/^(0|[1-9]\d{0,5})$/.test(threshold)) return err("invalid_threshold");
  return ok({ accountId: accountId || null, lowQuotaThreshold: Number(threshold) });
}
