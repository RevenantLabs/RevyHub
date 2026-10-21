import type { MonitorErrorCode } from "@/features/horizon-rate-limit-monitor/types";

export const copy = {
  accountLabel: "Account ID (optional)", accountHint: "Public G address only. Leave blank to check the root and ledgers endpoints.",
  thresholdLabel: "Low quota threshold", thresholdHint: "Whole number from 0 to 999999. Warn when remaining requests are below this count.",
  submit: "Check rate limits", refresh: "Check again", loading: "Reading Horizon rate limit headers…",
  emptyTitle: "No rate limits checked yet", emptyDescription: "Check the selected network to see the quota reported by each Horizon endpoint.",
  resultTitle: "Endpoint quotas", checkedAt: "Checked at", threshold: "Low quota threshold",
  endpoint: "Endpoint", limit: "X-RateLimit-Limit", remaining: "X-RateLimit-Remaining", reset: "X-RateLimit-Reset", resetCountdown: "Reset countdown", reporting: "Header status",
  reported: "Reported", partial: "Partially reported", notReported: "Not reported", unavailable: "Not reported",
  lowQuotaTitle: "Low quota", lowQuotaDescription: "Remaining requests are below your threshold. Wait for the reset before making more requests.",
  elapsed: "Reset time passed"
} as const;
export const errorCopy: Record<MonitorErrorCode, { title: string; description: string }> = {
  invalid_account: { title: "Invalid account ID", description: "Enter a public G address, or leave the account field blank. Never enter a secret seed." },
  invalid_threshold: { title: "Invalid threshold", description: "Enter a whole number from 0 to 999999." },
  missing_headers: { title: "Unusable rate limit headers", description: "Horizon returned a malformed quota header. Check the endpoint or proxy configuration and try again." },
  rate_limited: { title: "Horizon rate limited this check", description: "Wait for the server quota to reset before checking again." },
  request_failed: { title: "Could not check Horizon", description: "Check your connection, selected network and account availability, then retry." }
};
