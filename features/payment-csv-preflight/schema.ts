import { err, ok, type Result } from "@/core/result/result";
import type { PreflightErrorCode, PreflightInput } from "@/features/payment-csv-preflight/types";

/**
 * Upper bound on the whole file, in characters.
 *
 * A payout file is read entirely in the browser, so the cap is what keeps a
 * mis-dropped archive from locking the main thread inside the parser.
 */
export const MAX_CSV_LENGTH = 2_000_000;

/** Upper bound on data rows, for the same reason. */
export const MAX_ROWS = 10_000;

/**
 * Upper bound on a chosen file, in bytes.
 *
 * Checked against `File.size` before a single byte is read, so an archive
 * picked by mistake never reaches memory at all.
 */
export const MAX_FILE_BYTES = 4_000_000;

/**
 * A NUL byte means the text is not text.
 *
 * `.xlsx`, `.numbers` and UTF-16 exports all arrive as decodable garbage
 * rather than as a read failure, and the parser would happily split them into
 * thousands of nonsense rows. Catching it here says "wrong file" instead.
 */
const NUL = String.fromCharCode(0);

/** Required header columns, in no particular order. */
export const REQUIRED_HEADERS = [
  "destination",
  "amount",
  "asset_code",
  "asset_issuer"
] as const;

/** Header columns that may appear, and are read when they do. */
export const OPTIONAL_HEADERS = ["memo_type", "memo_value"] as const;

export type RequiredHeader = (typeof REQUIRED_HEADERS)[number];
export type KnownHeader = RequiredHeader | (typeof OPTIONAL_HEADERS)[number];

/**
 * Validates the pasted or loaded text before it reaches the parser.
 *
 * Unlike the other slices here this one does *not* refuse a secret key at this
 * stage: a seed in a payout file belongs to a specific row, and rejecting the
 * whole import would hide which row it was. It is caught per row instead, and
 * that row's destination is never echoed back.
 */
export function parsePreflightInput(raw: string): Result<PreflightInput, PreflightErrorCode> {
  const csv = raw.trim();

  if (!csv) return err("empty_input");
  if (csv.length > MAX_CSV_LENGTH) return err("input_too_large");
  if (csv.includes(NUL)) return err("invalid_input");

  return ok({ csv });
}

export interface HeaderMap {
  /** Column index for each known header that is present. */
  columns: Map<KnownHeader, number>;
  optionalColumns: string[];
}

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Maps header names to column positions.
 *
 * A repeated header is rejected rather than resolved to the first or last
 * occurrence: either choice silently reads a different column than the author
 * intended, and on a payout file that is not a risk worth taking.
 */
export function readHeaders(fields: string[]): Result<HeaderMap, PreflightErrorCode> {
  const columns = new Map<KnownHeader, number>();
  const seen = new Set<string>();
  const optionalColumns: string[] = [];

  for (const [index, rawName] of fields.entries()) {
    const name = normalize(rawName);
    if (!name) continue;

    if (seen.has(name)) return err("invalid_headers");
    seen.add(name);

    if ((REQUIRED_HEADERS as readonly string[]).includes(name)) {
      columns.set(name as KnownHeader, index);
    } else if ((OPTIONAL_HEADERS as readonly string[]).includes(name)) {
      columns.set(name as KnownHeader, index);
      optionalColumns.push(name);
    }
  }

  for (const required of REQUIRED_HEADERS) {
    if (!columns.has(required)) return err("invalid_headers");
  }

  return ok({ columns, optionalColumns });
}
