import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type {
  TestnetKeypairGeneratorErrorCode,
  TestnetKeypairGeneratorInput
} from "@/features/testnet-keypair-generator/types";

export const MAX_LABEL_LENGTH = 50;

/**
 * Parses raw form input into a validated request, without throwing.
 *
 * Enforces strict security bounds: secret keys are prohibited as input
 * and rejected immediately before any further processing.
 */
export function parseTestnetKeypairGeneratorInput(
  rawLabel: string,
  checkNetwork: boolean = true
): Result<TestnetKeypairGeneratorInput, TestnetKeypairGeneratorErrorCode> {
  const normalized = normalizeInput(rawLabel);

  // Security guard: Reject any secret seed or secret key prefix
  if (
    normalized.startsWith("S") ||
    normalized.startsWith("s") ||
    /S[A-Z2-7]{20,}/i.test(normalized)
  ) {
    return err("secret_input_prohibited");
  }

  if (normalized.length > MAX_LABEL_LENGTH) {
    return err("label_too_long");
  }

  return ok({
    label: normalized || undefined,
    checkNetwork
  });
}
