import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { FaucetErrorCode, FaucetInput } from "@/features/testnet-faucet/types";

export function parseFaucetInput(raw: string): Result<FaucetInput, FaucetErrorCode> {
  const accountId = raw.replace(/\s+/g, "");

  if (!accountId) return err("empty_input");

  // A secret seed starts with S and would be a catastrophic paste here, so it
  // is rejected by the same checksum rule that rejects any non-G value.
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  return ok({ accountId });
}
