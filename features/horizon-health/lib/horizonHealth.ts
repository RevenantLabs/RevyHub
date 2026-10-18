import { horizonUrl } from "@/core/horizon/client";
import { runHorizonRequest } from "@/core/horizon/request";
import { ok, err, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { isHorizonRoot } from "../schema";
import { toHorizonHealthErrorCode } from "./horizonHealth.errors";
import type { HorizonHealthInput, HorizonHealthResult, HorizonHealthErrorCode } from "../types";
export const DEGRADED_LAG = 5;
export async function runHorizonHealth(_input: HorizonHealthInput, network: StellarNetwork, signal?: AbortSignal): Promise<Result<HorizonHealthResult, HorizonHealthErrorCode>> {
  const endpoint = horizonUrl(network, "/");
  try {
    return await runHorizonRequest((async (): Promise<Result<HorizonHealthResult, HorizonHealthErrorCode>> => {
      const response = await fetch(endpoint, { signal });
      if (!response.ok) return err("request_failed");
      let body: unknown;
      try { body = await response.json(); } catch { return err("unexpected_response"); }
      if (!isHorizonRoot(body)) return err("unexpected_response");
      const lag = Math.max(0, body.core_latest_ledger - body.history_latest_ledger);
      return ok({ endpoint, observedAt: new Date().toISOString(), coreLatest: body.core_latest_ledger,
        historyLatest: body.history_latest_ledger, historyElder: body.history_elder_ledger,
        lag, degraded: lag > DEGRADED_LAG, horizonVersion: body.horizon_version, coreVersion: body.core_version,
        rateLimit: { limit: response.headers.get("x-ratelimit-limit"), remaining: response.headers.get("x-ratelimit-remaining"), reset: response.headers.get("x-ratelimit-reset") }
      });
    })(), { signal });
  } catch (error) { return err(toHorizonHealthErrorCode(error)); }
}
