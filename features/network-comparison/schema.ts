import { err, ok, type Result } from "@/core/result/result";
import type {
  NetworkComparisonErrorCode,
  NetworkComparisonInput
} from "@/features/network-comparison/types";

/**
 * Validates request input and guards against accidental secret key submission.
 *
 * @param raw - Optional raw input string to validate.
 * @returns Result containing validated input or an error code.
 */
export function parseNetworkComparisonInput(
  raw?: string
): Result<NetworkComparisonInput, NetworkComparisonErrorCode> {
  if (raw && raw.trim().toUpperCase().startsWith("S") && raw.trim().length > 1) {
    return err("request_failed");
  }
  return ok({ refreshedAt: Date.now() });
}
