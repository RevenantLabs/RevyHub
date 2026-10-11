import { ok, err, type Result } from "@/core/result/result";
import type {
  HorizonPageInfo,
  HorizonPaginationErrorCode,
} from "@/features/horizon-pagination-inspector/types";

export function parseHorizonResponse(
  input: string
): Result<HorizonPageInfo, HorizonPaginationErrorCode> {
  if (!input.trim()) return err("empty_input");

  // Try to parse as JSON first
  if (input.trim().startsWith("{")) {
    try {
      return parseJsonResponse(JSON.parse(input));
    } catch {
      return err("invalid_response");
    }
  }

  // Try to parse as URL with cursor param
  if (input.includes("://") || input.startsWith("/")) {
    return parseUrlResponse(input);
  }

  // Try to parse as Link header
  if (input.includes("</")) {
    return parseLinkHeader(input);
  }

  return err("invalid_response");
}

function parseJsonResponse(body: any): Result<HorizonPageInfo, HorizonPaginationErrorCode> {
  if (!body || typeof body !== "object") return err("invalid_response");

  const records = Array.isArray(body._embedded?.records)
    ? body._embedded.records.length
    : Array.isArray(body.records)
    ? body.records.length
    : 0;

  const links = body._links || {};
  const nextCursor = extractCursor(links.next?.href);
  const prevCursor = extractCursor(links.prev?.href);
  const selfHref = links.self?.href || "";

  return ok({
    records,
    nextCursor: nextCursor || undefined,
    prevCursor: prevCursor || undefined,
    selfHref,
    hasNextPage: !!nextCursor,
    hasPrevPage: !!prevCursor,
  });
}

function parseUrlResponse(url: string): Result<HorizonPageInfo, HorizonPaginationErrorCode> {
  try {
    const parsed = new URL(url, "https://horizon.stellar.org");
    const cursor = parsed.searchParams.get("cursor") || undefined;

    return ok({
      records: 0,
      nextCursor: cursor,
      prevCursor: undefined,
      selfHref: parsed.pathname + parsed.search,
      hasNextPage: !!cursor,
      hasPrevPage: false,
    });
  } catch {
    return err("invalid_response");
  }
}

function parseLinkHeader(header: string): Result<HorizonPageInfo, HorizonPaginationErrorCode> {
  const nextMatch = header.match(/<([^>]+)>;\s*rel="next"/);
  const prevMatch = header.match(/<([^>]+)>;\s*rel="prev"/);
  const selfMatch = header.match(/<([^>]+)>;\s*rel="self"/);

  const nextCursor = nextMatch ? extractCursor(nextMatch[1]) : undefined;
  const prevCursor = prevMatch ? extractCursor(prevMatch[1]) : undefined;
  const selfHref = selfMatch ? selfMatch[1] : "";

  return ok({
    records: 0,
    nextCursor,
    prevCursor,
    selfHref,
    hasNextPage: !!nextCursor,
    hasPrevPage: !!prevCursor,
  });
}

function extractCursor(href?: string): string | null {
  if (!href) return null;
  try {
    const url = new URL(href, "https://horizon.stellar.org");
    return url.searchParams.get("cursor") || null;
  } catch {
    return null;
  }
}

export function buildPaginatedUrl(
  baseUrl: string,
  cursor?: string,
  limit?: number
): string {
  const url = new URL(baseUrl, "https://horizon.stellar.org");
  if (cursor) url.searchParams.set("cursor", cursor);
  if (limit) url.searchParams.set("limit", String(limit));
  return url.toString();
}
