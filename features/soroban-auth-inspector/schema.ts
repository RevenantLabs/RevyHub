import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type {
  SorobanAuthInspectorErrorCode,
  SorobanAuthInspectorInput
} from "@/features/soroban-auth-inspector/types";

/**
 * Parses raw form input into a validated transaction envelope XDR.
 *
 * The input must be a base64-encoded Stellar transaction envelope. This step
 * only validates shape; decoding into an envelope happens in the tool logic.
 */
export function parseSorobanAuthInspectorInput(
  raw: string
): Result<SorobanAuthInspectorInput, SorobanAuthInspectorErrorCode> {
  const xdr = normalizeInput(raw);
  if (!xdr) return err("empty_input");

  if (!isBase64(xdr)) return err("invalid_base64");

  return ok({ xdr });
}

function isBase64(value: string): boolean {
  try {
    return Buffer.from(value, "base64").toString("base64") === value;
  } catch {
    return false;
  }
}
