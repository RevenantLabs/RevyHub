import { describe, expect, it } from "vitest";
import { readRateLimitHeaders } from "@/features/horizon-rate-limit-monitor/lib/rate-limit-headers";
import { fullHeaders } from "@/features/horizon-rate-limit-monitor/fixtures/full-headers.fixture";
import { missingHeaders, partialHeaders, malformedHeaders } from "@/features/horizon-rate-limit-monitor/fixtures/missing-headers.fixture";

describe("rate limit header reader", () => {
  it("reads all three case-insensitive response headers", () => {
    expect(readRateLimitHeaders(new Headers(fullHeaders))).toEqual({ malformed: false, value: { limit: "1000", remaining: "8", reset: "2000000000", reporting: "reported" } });
  });
  it("distinguishes missing and partial reporting from malformed values", () => {
    expect(readRateLimitHeaders(new Headers(missingHeaders)).value.reporting).toBe("not_reported");
    expect(readRateLimitHeaders(new Headers(partialHeaders)).value).toEqual({ limit: "1000", remaining: null, reset: null, reporting: "partial" });
    expect(readRateLimitHeaders(new Headers(malformedHeaders)).malformed).toBe(true);
  });
});
