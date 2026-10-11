import { err, ok, type Result } from "@/core/result/result";
import type {
  HorizonPaginationInspectorErrorCode,
  HorizonPaginationInspectorInput,
  HorizonPaginationReport,
  ParsedLink,
  RecordInspection
} from "@/features/horizon-pagination-inspector/types";

const HOSTILE_SCHEME_PATTERN = /^(javascript|data|vbscript|file):/i;

/** Extracts a query parameter value while strictly preserving raw percent-encoding. */
export function extractQueryParamRaw(search: string, paramName: string): string | null {
  const cleanSearch = search.startsWith("?") ? search.slice(1) : search;
  if (!cleanSearch) {
    return null;
  }

  const pairs = cleanSearch.split("&");
  for (const pair of pairs) {
    const splitIndex = pair.indexOf("=");
    const key = splitIndex >= 0 ? pair.slice(0, splitIndex) : pair;
    const value = splitIndex >= 0 ? pair.slice(splitIndex + 1) : "";
    if (key === paramName) {
      return value;
    }
  }

  return null;
}

/** Parses a HAL link object and audits its structure, origin, and query parameters. */
export function parseHalLink(
  rel: string,
  linkValue: unknown,
  expectedOrigin: string | null
): ParsedLink | null {
  if (!linkValue || typeof linkValue !== "object" || Array.isArray(linkValue)) {
    return null;
  }

  const linkObj = linkValue as Record<string, unknown>;
  if (typeof linkObj.href !== "string") {
    return null;
  }

  const rawHref = linkObj.href;
  const isTemplated = Boolean(linkObj.templated) || (rawHref.includes("{") && rawHref.includes("}"));
  const isHostile = HOSTILE_SCHEME_PATTERN.test(rawHref.trim());

  let scheme: string | null = null;
  let origin: string | null = null;
  let endpointPath: string | null = null;
  let cursor: string | null = null;
  let order: string | null = null;
  let limit: string | null = null;
  let isValidHttp = false;

  if (!isHostile) {
    try {
      const parsedUrl = new URL(rawHref, "http://local.dummy");
      scheme = parsedUrl.protocol;
      const isAbsolute = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(rawHref);

      if (isAbsolute && (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:")) {
        isValidHttp = true;
        origin = parsedUrl.origin;
      }

      endpointPath = parsedUrl.pathname;
      cursor = extractQueryParamRaw(parsedUrl.search, "cursor");
      order = extractQueryParamRaw(parsedUrl.search, "order");
      limit = extractQueryParamRaw(parsedUrl.search, "limit");
    } catch {
      scheme = null;
    }
  }

  const isOffOrigin = Boolean(
    expectedOrigin && origin && origin.toLowerCase() !== expectedOrigin.toLowerCase()
  );

  return {
    rel,
    href: rawHref,
    templated: isTemplated,
    scheme,
    isValidHttp: isValidHttp && !isTemplated,
    isHostileScheme: isHostile,
    origin,
    endpointPath,
    cursor,
    order,
    limit,
    isOffOrigin
  };
}

/** Performs offline structural diagnosis and pagination audit of a Horizon collection. */
export function inspectHorizonPagination(
  input: HorizonPaginationInspectorInput
): Result<HorizonPaginationReport, HorizonPaginationInspectorErrorCode> {
  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(input.collectionText);
  } catch {
    return err("invalid_json");
  }

  if (
    !parsedPayload ||
    typeof parsedPayload !== "object" ||
    Array.isArray(parsedPayload)
  ) {
    return err("invalid_collection");
  }

  const envelope = parsedPayload as Record<string, unknown>;

  if (
    !envelope._embedded ||
    typeof envelope._embedded !== "object" ||
    Array.isArray(envelope._embedded)
  ) {
    return err("invalid_collection");
  }

  const embedded = envelope._embedded as Record<string, unknown>;
  if (!Array.isArray(embedded.records)) {
    return err("invalid_collection");
  }

  if (
    !envelope._links ||
    typeof envelope._links !== "object" ||
    Array.isArray(envelope._links)
  ) {
    return err("invalid_collection");
  }

  const rawRecords = embedded.records;
  const idCounts = new Map<string, number>();
  const tokenCounts = new Map<string, number>();

  const preliminaryRecords = rawRecords.map((record, index) => {
    let id: string | null = null;
    let pagingToken: string | null = null;

    if (record && typeof record === "object" && !Array.isArray(record)) {
      const rec = record as Record<string, unknown>;
      if (rec.id !== undefined && rec.id !== null) {
        id = String(rec.id);
      }
      if (rec.paging_token !== undefined && rec.paging_token !== null) {
        pagingToken = String(rec.paging_token);
      }
    }

    if (id && id.trim().length > 0) {
      idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
    }
    if (pagingToken && pagingToken.trim().length > 0) {
      tokenCounts.set(pagingToken, (tokenCounts.get(pagingToken) ?? 0) + 1);
    }

    return {
      index,
      id,
      pagingToken,
      missingId: id === null || id.trim() === "",
      missingToken: pagingToken === null || pagingToken.trim() === ""
    };
  });

  const duplicateIdSet = new Set<string>();
  for (const [id, count] of idCounts.entries()) {
    if (count > 1) {
      duplicateIdSet.add(id);
    }
  }

  const duplicateTokenSet = new Set<string>();
  for (const [token, count] of tokenCounts.entries()) {
    if (count > 1) {
      duplicateTokenSet.add(token);
    }
  }

  const auditedRecords: RecordInspection[] = preliminaryRecords.map((rec) => ({
    ...rec,
    duplicateId: rec.id !== null && duplicateIdSet.has(rec.id),
    duplicateToken: rec.pagingToken !== null && duplicateTokenSet.has(rec.pagingToken)
  }));

  const missingIdCount = auditedRecords.filter((r) => r.missingId).length;
  const missingTokenCount = auditedRecords.filter((r) => r.missingToken).length;
  const duplicateIdCount = auditedRecords.filter((r) => r.duplicateId).length;
  const duplicateTokenCount = auditedRecords.filter((r) => r.duplicateToken).length;

  const linksObj = envelope._links as Record<string, unknown>;
  const selfLink = linksObj.self
    ? parseHalLink("self", linksObj.self, input.expectedOrigin)
    : null;
  const nextLink = linksObj.next
    ? parseHalLink("next", linksObj.next, input.expectedOrigin)
    : null;
  const prevLink = linksObj.prev
    ? parseHalLink("prev", linksObj.prev, input.expectedOrigin)
    : null;

  const otherLinks: ParsedLink[] = [];
  for (const [key, value] of Object.entries(linksObj)) {
    if (key !== "self" && key !== "next" && key !== "prev") {
      const parsed = parseHalLink(key, value, input.expectedOrigin);
      if (parsed) {
        otherLinks.push(parsed);
      }
    }
  }

  const allParsedLinks: ParsedLink[] = [
    ...(selfLink ? [selfLink] : []),
    ...(nextLink ? [nextLink] : []),
    ...(prevLink ? [prevLink] : []),
    ...otherLinks
  ];

  const hasOffOriginLinks = allParsedLinks.some((link) => link.isOffOrigin);
  const hasAnomalies =
    duplicateIdCount > 0 ||
    duplicateTokenCount > 0 ||
    missingIdCount > 0 ||
    missingTokenCount > 0;

  return ok({
    recordCount: auditedRecords.length,
    records: auditedRecords,
    uniqueIdCount: idCounts.size,
    duplicateIdCount,
    duplicateIds: Array.from(duplicateIdSet),
    missingIdCount,
    uniqueTokenCount: tokenCounts.size,
    duplicateTokenCount,
    duplicateTokens: Array.from(duplicateTokenSet),
    missingTokenCount,
    hasAnomalies,
    selfLink,
    nextLink,
    prevLink,
    otherLinks,
    hasOffOriginLinks,
    expectedOrigin: input.expectedOrigin,
    isSinglePageObservation: true
  });
}
