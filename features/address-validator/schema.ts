import { err, ok, type Result } from "@/core/result/result";
import type { AddressErrorCode, AddressInput } from "@/features/address-validator/types";

/**
 * Parses raw form input into a validated request.
 *
 * Whitespace is stripped entirely (not just trimmed) because addresses are
 * frequently pasted out of wrapped terminal output or chat messages.
 */
export function parseAddressInput(raw: string): Result<AddressInput, AddressErrorCode> {
  const address = raw.replace(/\s+/g, "");
  if (!address) return err("empty_input");
  return ok({ address });
}
