import { err, ok, type Result } from "@/core/result/result";
import type { Sep38QuoteViewerErrorCode } from "@/features/sep38-quote-viewer/types";

export const DEFAULT_TIMEOUT_MS = 8_000;
const MAX_BODY_BYTES = 100 * 1024;

export interface QuoteFetchOptions {
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface PublicResponse {
  status: number;
  body: string;
  url: string;
}

/** Maps unexpected transport failures onto this tool's error codes. */
export function toSep38QuoteViewerErrorCode(error: unknown): Sep38QuoteViewerErrorCode {
  if (error instanceof Error && error.name === "AbortError") return "request_failed";
  return "request_failed";
}

function combinedSignal(options: QuoteFetchOptions): AbortSignal | undefined {
  const timeout =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
      : undefined;
  if (!options.signal) return timeout;
  if (!timeout) return options.signal;
  if (typeof AbortSignal.any === "function") return AbortSignal.any([options.signal, timeout]);
  return options.signal;
}

/**
 * GET a public document. Network failures, aborts, and redirects become
 * `request_failed`. HTTP error statuses are returned so the caller can tell
 * an unsupported pair apart from a broken response.
 */
export async function getPublic(
  url: string,
  options: QuoteFetchOptions & { accept: string }
): Promise<Result<PublicResponse, "request_failed">> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") return err("request_failed");
  if (options.signal?.aborted) return err("request_failed");

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: combinedSignal(options),
      headers: { Accept: options.accept }
    });

    if (
      response.type === "opaqueredirect" ||
      response.status === 0 ||
      (response.status >= 300 && response.status < 400)
    ) {
      return err("request_failed");
    }

    const body = await response.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) return err("request_failed");
    return ok({ status: response.status, body, url: response.url || url });
  } catch {
    return err("request_failed");
  }
}
