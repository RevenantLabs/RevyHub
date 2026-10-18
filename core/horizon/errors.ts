/**
 * Shared Horizon failure taxonomy.
 *
 * Every feature that talks to Horizon maps transport failures through
 * `classifyHorizonError` so error handling stays identical across slices.
 */

export type HorizonErrorCode =
  | "not_found"
  | "rate_limited"
  | "bad_request"
  | "server_error"
  | "network_unavailable"
  | "timeout"
  | "unknown";

export interface HorizonErrorDetail {
  status?: number;
  title?: string;
  detail?: string;
}

export function responseStatusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  if ("response" in error) {
    const response = (error as { response?: { status?: number } }).response;
    if (typeof response?.status === "number") return response.status;
  }

  if ("status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }

  return undefined;
}

export function classifyHorizonError(error: unknown): {
  code: HorizonErrorCode;
  detail: HorizonErrorDetail;
} {
  const status = responseStatusOf(error);
  const detail: HorizonErrorDetail = { status };

  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: { title?: string; detail?: string } } })
      .response?.data;
    if (data?.title) detail.title = data.title;
    if (data?.detail) detail.detail = data.detail;
  }

  if (status === 404) return { code: "not_found", detail };
  if (status === 429) return { code: "rate_limited", detail };
  if (status === 400 || status === 422) return { code: "bad_request", detail };
  if (typeof status === "number" && status >= 500) return { code: "server_error", detail };

  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("abort") || message.includes("timeout")) {
    return { code: "timeout", detail };
  }
  if (message.includes("fetch") || message.includes("network")) {
    return { code: "network_unavailable", detail };
  }

  return { code: "unknown", detail };
}
