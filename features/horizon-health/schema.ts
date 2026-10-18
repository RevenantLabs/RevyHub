import { ok, type Result } from "@/core/result/result";
import type { HorizonHealthInput, HorizonHealthErrorCode } from "./types";
/** No user URL is accepted: the selected network determines the endpoint. */
export function parseHorizonHealthInput(): Result<HorizonHealthInput, HorizonHealthErrorCode> {
  return ok({ inspect: true });
}
export function isHorizonRoot(value: unknown): value is {
  core_latest_ledger: number; history_latest_ledger: number; history_elder_ledger: number;
  horizon_version: string; core_version: string;
} {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  const ledger = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 4294967295;
  return ledger(row.core_latest_ledger) && ledger(row.history_latest_ledger) && ledger(row.history_elder_ledger)
    && row.history_elder_ledger <= row.history_latest_ledger
    && typeof row.horizon_version === "string" && row.horizon_version.length > 0
    && typeof row.core_version === "string" && row.core_version.length > 0;
}
