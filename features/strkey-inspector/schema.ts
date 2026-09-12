import { err, ok, type Result } from "@/core/result/result";
import type {
  StrkeyInspectorErrorCode,
  StrkeyInspectorInput
} from "@/features/strkey-inspector/types";

/**
 * Parses raw form input into a validated request without throwing.
 */
export function parseStrkeyInspectorInput(
  raw: string
): Result<StrkeyInspectorInput, StrkeyInspectorErrorCode> {
  const value = raw.replace(/\s+/g, "");
  if (!value) return err("empty_input");
  if (value.startsWith("S") || value.startsWith("s")) {
    return err("secret_seed_rejected");
  }
  return ok({ value });
}
