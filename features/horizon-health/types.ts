export type HorizonHealthErrorCode = "endpoint_unreachable" | "unexpected_response" | "degraded" | "request_failed";
export interface HorizonHealthInput { readonly inspect: true }
export interface HorizonHealthResult {
  coreLatest: number; historyLatest: number; historyElder: number; lag: number;
  horizonVersion: string; coreVersion: string; degraded: boolean;
  observedAt: string; endpoint: string;
  rateLimit: { limit: string | null; remaining: string | null; reset: string | null };
}
