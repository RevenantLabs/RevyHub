import { err, ok, type Result } from "@/core/result/result";
import type {
  TransactionBalanceChangeReconcilerErrorCode,
  TransactionBalanceChangeReconcilerInput
} from "@/features/transaction-balance-change-reconciler/types";

/** Upper bound per XDR blob so a pasted dump cannot reach the decoder. */
export const MAX_XDR_LENGTH = 65_536;

/** Network passphrases are short sentences, not documents. */
export const MAX_PASSPHRASE_LENGTH = 256;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

export interface RawReconcilerInput {
  envelopeXdr: string;
  resultXdr: string;
  metaXdr: string;
  networkPassphrase: string;
}

function strip(value: string): string {
  return value.replace(/\s+/g, "");
}

function checkXdr(value: string): TransactionBalanceChangeReconcilerErrorCode | null {
  if (value.length > MAX_XDR_LENGTH) return "too_large";
  if (SECRET_SEED.test(value)) return "invalid_input";
  if (!value || value.length % 4 !== 0 || !BASE64.test(value)) return "malformed_data";
  return null;
}

/**
 * Validates envelope, result and metadata independently before any decode.
 *
 * A secret seed is refused on the `S` prefix alone and never returned. Size
 * limits sit in front of the decoder so a pasted archive cannot become a
 * denial-of-service against the browser tab.
 */
export function parseTransactionBalanceChangeReconcilerInput(
  raw: RawReconcilerInput
): Result<TransactionBalanceChangeReconcilerInput, TransactionBalanceChangeReconcilerErrorCode> {
  const envelopeXdr = strip(raw.envelopeXdr);
  const resultXdr = strip(raw.resultXdr);
  const metaXdr = strip(raw.metaXdr);
  const networkPassphrase = raw.networkPassphrase.trim();

  if (!envelopeXdr || !resultXdr || !metaXdr || !networkPassphrase) {
    return err("empty_input");
  }

  if (networkPassphrase.length > MAX_PASSPHRASE_LENGTH) return err("too_large");

  for (const blob of [envelopeXdr, resultXdr, metaXdr]) {
    const problem = checkXdr(blob);
    if (problem) return err(problem);
  }

  return ok({ envelopeXdr, resultXdr, metaXdr, networkPassphrase });
}
