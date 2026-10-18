import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  BalanceViewerErrorCode,
  BalanceViewerInput
} from "@/features/balance-viewer/types";

export function parseBalanceViewerInput(
  raw: string
): Result<BalanceViewerInput, BalanceViewerErrorCode> {
  const accountId = raw.replace(/\s+/g, "");

  if (!accountId) return err("empty_input");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  return ok({ accountId });
}
