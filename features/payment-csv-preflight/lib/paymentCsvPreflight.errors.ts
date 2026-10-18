import { err, ok, type Result } from "@/core/result/result";
import { MAX_FILE_BYTES } from "@/features/payment-csv-preflight/schema";
import type { PreflightErrorCode, RowIssueCode } from "@/features/payment-csv-preflight/types";

/**
 * Maps this tool's one I/O boundary onto its own error codes.
 *
 * The tool makes no network requests, so the only thing that can fail outside
 * pure logic is reading a local file. `File.text()` rejects for an unreadable
 * or revoked handle — a dragged file removed from disk, or a permission
 * revoked mid-read — and neither of those should surface as a thrown error in
 * a slice whose logic never throws.
 */
export async function readCsvFile(file: File): Promise<Result<string, PreflightErrorCode>> {
  // Size is checked before any read so an oversized file is never held in
  // memory, not even briefly.
  if (file.size === 0) return err("empty_input");
  if (file.size > MAX_FILE_BYTES) return err("input_too_large");

  try {
    return ok(await file.text());
  } catch {
    return err("invalid_input");
  }
}

/**
 * True when a row's value must never be rendered.
 *
 * The destination is already blanked before it reaches state, so this is the
 * second gate rather than the only one: a component asking "may I show this?"
 * gets the same answer as the parser that dropped it.
 */
export function shouldRedact(issues: readonly RowIssueCode[]): boolean {
  return issues.includes("secret_key_destination");
}
