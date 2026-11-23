import { Keypair } from "@stellar/stellar-sdk";
import type { HorizonTransactionRecord } from "@/features/transaction-sequence-gap-auditor/types";

export const accountId = Keypair.fromRawEd25519Seed(Uint8Array.from({ length: 32 }, (_, i) => i + 1))
  .publicKey();

export function transactionRecord(
  sequence: string,
  overrides: Partial<HorizonTransactionRecord> = {}
): HorizonTransactionRecord {
  return {
    hash: `hash-${sequence}`,
    paging_token: `${BigInt(sequence) * 10n}`,
    source_account: accountId,
    source_account_sequence: sequence,
    successful: true,
    ledger: "12345",
    created_at: "2026-01-01T00:00:00Z",
    operation_count: 1,
    ...overrides
  };
}

export const normalRecords = [
  transactionRecord("102"),
  transactionRecord("101"),
  transactionRecord("100")
];

export const largeSequenceRecords = [
  transactionRecord("9223372036854775806"),
  transactionRecord("9223372036854775805")
];

export const normalPage = { _embedded: { records: normalRecords } };
