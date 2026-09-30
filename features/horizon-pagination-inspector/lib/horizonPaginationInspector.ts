import { err, ok, type Result } from "@/core/result/result";
import type {
  DuplicateIdentifier,
  LinkSummary,
  PaginationErrorCode,
  PaginationInspection,
  PaginationInspectorInput,
  QueryParameter,
  TokenOrder
} from "@/features/horizon-pagination-inspector/types";

/** Paging tokens are decimal strings, never JavaScript numbers. */
const DECIMAL = /^[0-9]+$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Percent-decoding is applied to present the link, never to interpret it. A
 * malformed escape is shown verbatim rather than thrown on, because the raw
 * form is still the thing the server actually sent.
 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/[+]/g, " "));
  } catch {
    return value;
  }
}

/**
 * Reads a Horizon link object into the pieces worth showing.
 *
 * The query string is split rather than parsed into a URL object, because the
 * parseable-and-never-interpreted distinction matters here: this tool reports
 * what the link says, and never rebuilds or normalises it.
 */
export function parseLink(value: unknown): LinkSummary | null {
  if (!isPlainObject(value)) return null;

  const href = readNonEmptyString(value.href);
  if (href === null) return null;

  const params: QueryParameter[] = [];
  const queryStart = href.indexOf("?");

  if (queryStart >= 0) {
    for (const pair of href.slice(queryStart + 1).split("&")) {
      if (!pair) continue;

      const equals = pair.indexOf("=");
      const rawName = equals === -1 ? pair : pair.slice(0, equals);
      const rawValue = equals === -1 ? "" : pair.slice(equals + 1);

      params.push({ name: safeDecode(rawName), value: safeDecode(rawValue) });
    }
  }

  const cursorParam = params.find((param) => param.name === "cursor");

  return { href, cursor: cursorParam ? cursorParam.value : null, params };
}

/**
 * Decides what this page alone can honestly say about token ordering.
 *
 * One token establishes no order, so it is reported as undetermined rather
 * than dressed up as "increasing". The same applies when any record lacks a
 * comparable token: a partial view cannot speak for the page as a whole.
 */
export function determineTokenOrder(numericTokens: bigint[], nonNumericCount: number): TokenOrder {
  if (numericTokens.length === 0) return "none";
  if (nonNumericCount > 0) return "undetermined";
  if (numericTokens.length < 2) return "undetermined";

  for (let index = 1; index < numericTokens.length; index += 1) {
    if (numericTokens[index] <= numericTokens[index - 1]) return "not_increasing";
  }

  return "increasing";
}

function analyze(envelope: Record<string, unknown>, records: unknown[]): PaginationInspection {
  const missingIdentifiers: number[] = [];
  const nonNumericTokens: number[] = [];
  const numericTokens: bigint[] = [];
  const indexesByKey = new Map<string, number[]>();

  records.forEach((record, index) => {
    const source = isPlainObject(record) ? record : {};
    const pagingToken = readNonEmptyString(source.paging_token);
    const id = readNonEmptyString(source.id);
    const key = pagingToken ?? id;

    if (key === null) {
      missingIdentifiers.push(index);
    } else {
      const existing = indexesByKey.get(key);
      if (existing) existing.push(index);
      else indexesByKey.set(key, [index]);
    }

    if (pagingToken === null || !DECIMAL.test(pagingToken)) {
      nonNumericTokens.push(index);
    } else {
      // BigInt rather than Number: paging tokens regularly exceed
      // Number.MAX_SAFE_INTEGER, and a lossy comparison would silently
      // mis-report the order it exists to check.
      numericTokens.push(BigInt(pagingToken));
    }
  });

  const duplicates: DuplicateIdentifier[] = [];
  indexesByKey.forEach((indexes, key) => {
    if (indexes.length > 1) duplicates.push({ key, indexes });
  });

  const links = isPlainObject(envelope._links) ? envelope._links : null;

  return {
    recordCount: records.length,
    hasLinksObject: links !== null,
    next: links ? parseLink(links.next) : null,
    prev: links ? parseLink(links.prev) : null,
    missingIdentifiers,
    nonNumericTokens,
    duplicates,
    tokenOrder: determineTokenOrder(numericTokens, nonNumericTokens.length)
  };
}

/**
 * Reads a pasted Horizon collection response and explains its paging state.
 *
 * No request is made and nothing is persisted: the input is a document the
 * user already has, and the whole point is to read it without handing it to a
 * third party. Every expected failure is a value, not an exception.
 */
export function inspectPagination(
  input: PaginationInspectorInput
): Result<PaginationInspection, PaginationErrorCode> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(input.text);
  } catch {
    return err("not_json");
  }

  if (!isPlainObject(parsed)) return err("not_an_object");

  const embedded = parsed._embedded;
  if (!isPlainObject(embedded)) return err("missing_records");

  const records = embedded.records;
  if (records === undefined || records === null) return err("missing_records");
  if (!Array.isArray(records)) return err("records_not_an_array");

  return ok(analyze(parsed, records));
}
