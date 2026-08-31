import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ReserveCalculatorErrorCode, ReserveCalculatorInput } from "@/features/reserve-calculator/types";

/** Validates a public account address without ever echoing a secret seed. */
export function parseReserveCalculatorInput(
  raw: string
): Result<ReserveCalculatorInput, ReserveCalculatorErrorCode> {
  const accountId = raw.replace(/\s+/g, "");

  if (!accountId) return err("empty_input");
  if (accountId.startsWith("S")) return err("invalid_address");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  return ok({ accountId });
}
