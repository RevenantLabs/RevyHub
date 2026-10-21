import type { RateLimitHeaders } from "@/features/horizon-rate-limit-monitor/types";
export function readRateLimitHeaders(headers: Headers): { value: RateLimitHeaders; malformed: boolean } {
  const values = ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"].map((name) => headers.get(name));
  const malformed = values.some((value) => value !== null && !/^(0|[1-9]\d*)$/.test(value.trim()));
  const [limit, remaining, reset] = values.map((value) => value?.trim() ?? null);
  const count = values.filter((value) => value !== null).length;
  return { value: { limit, remaining, reset, reporting: count === 0 ? "not_reported" : count === 3 ? "reported" : "partial" }, malformed };
}
