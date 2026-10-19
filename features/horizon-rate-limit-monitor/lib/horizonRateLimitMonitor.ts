import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { parseMonitorInput } from "@/features/horizon-rate-limit-monitor/schema";
import { readRateLimitHeaders } from "@/features/horizon-rate-limit-monitor/lib/rate-limit-headers";
import { isLowQuota } from "@/features/horizon-rate-limit-monitor/lib/low-quota-flag";
import { responseError, transportError } from "@/features/horizon-rate-limit-monitor/lib/horizonRateLimitMonitor.errors";
import type { EndpointQuota, MonitorErrorCode, MonitorResult } from "@/features/horizon-rate-limit-monitor/types";

export async function getHorizonRateLimits(network: StellarNetwork, accountRaw: string, thresholdRaw: string, signal?: AbortSignal): Promise<Result<MonitorResult, MonitorErrorCode>> {
  const parsed = parseMonitorInput(accountRaw, thresholdRaw);
  if (!parsed.ok) return parsed;
  const paths = ["/", "/ledgers", ...(parsed.value.accountId ? [`/accounts/${parsed.value.accountId}`] : [])];
  try {
    const endpoints: EndpointQuota[] = [];
    for (const endpoint of paths) {
      // The SDK discards response headers, so use raw GET without reading the body.
      const response = await fetch(horizonUrl(network, endpoint), { method: "GET", signal });
      if (!response.ok) return err(responseError(response.status));
      const read = readRateLimitHeaders(response.headers);
      if (read.malformed) return err("missing_headers");
      endpoints.push({ endpoint, headers: read.value, lowQuota: isLowQuota(read.value.remaining, parsed.value.lowQuotaThreshold) });
    }
    return ok({ network, checkedAt: Date.now(), lowQuotaThreshold: parsed.value.lowQuotaThreshold, endpoints });
  } catch { return err(transportError()); }
}
