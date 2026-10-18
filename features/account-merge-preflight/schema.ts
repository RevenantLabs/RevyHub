import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AccountMergeField,
  AccountMergePreflightErrorCode,
  AccountMergePreflightInput
} from "@/features/account-merge-preflight/types";

export type RawAccountMergePreflightInput = AccountMergePreflightInput;

export const FIELD_OF_CODE: Record<
  AccountMergePreflightErrorCode,
  AccountMergeField | null
> = {
  empty_source: "sourceAccountId",
  invalid_source: "sourceAccountId",
  empty_destination: "destinationAccountId",
  invalid_destination: "destinationAccountId",
  same_account: "destinationAccountId",
  source_not_found: "sourceAccountId",
  destination_not_found: "destinationAccountId",
  request_failed: null
};

function normalizeAddress(value: string): string {
  return value.replace(/\s+/g, "");
}

function isPublicAccount(value: string): boolean {
  return !value.startsWith("S") && StrKey.isValidEd25519PublicKey(value);
}

export function parseAccountMergePreflightInput(
  raw: RawAccountMergePreflightInput
): Result<AccountMergePreflightInput, AccountMergePreflightErrorCode> {
  const sourceAccountId = normalizeAddress(raw.sourceAccountId);
  const destinationAccountId = normalizeAddress(raw.destinationAccountId);

  if (!sourceAccountId) return err("empty_source");
  if (!isPublicAccount(sourceAccountId)) return err("invalid_source");
  if (!destinationAccountId) return err("empty_destination");
  if (!isPublicAccount(destinationAccountId)) return err("invalid_destination");
  if (sourceAccountId === destinationAccountId) return err("same_account");

  return ok({ sourceAccountId, destinationAccountId });
}
