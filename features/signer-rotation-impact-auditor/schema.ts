import { err, ok, type Result } from "@/core/result/result";
import type {
  SignerRotationErrorCode,
  SignerRotationInput
} from "@/features/signer-rotation-impact-auditor/types";

/** Horizon account JSON can be large; cap before JSON.parse. */
export const MAX_SNAPSHOT_LENGTH = 1_048_576;

/** Upper bound for a single transaction envelope. */
export const MAX_ENVELOPE_LENGTH = 65_536;

/** Network passphrases are short sentences, not documents. */
export const MAX_PASSPHRASE_LENGTH = 256;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /S[A-Z2-7]{55}/;

export interface RawSignerRotationInput {
  accountSnapshot: string;
  envelopeXdr: string;
  networkPassphrase: string;
}

/**
 * Validates raw form text before any decode or JSON parse.
 *
 * Secret seeds are refused on the prefix alone and never returned in the
 * validated value, so a refused paste cannot leak into hook state.
 */
export function parseSignerRotationInput({
  accountSnapshot: rawSnapshot,
  envelopeXdr: rawEnvelope,
  networkPassphrase: rawPassphrase
}: RawSignerRotationInput): Result<SignerRotationInput, SignerRotationErrorCode> {
  const accountSnapshot = rawSnapshot.trim();
  const envelopeXdr = rawEnvelope.replace(/\s+/g, "");
  const networkPassphrase = rawPassphrase.trim();

  if (!accountSnapshot || !envelopeXdr || !networkPassphrase) return err("empty_input");

  if (
    accountSnapshot.length > MAX_SNAPSHOT_LENGTH ||
    envelopeXdr.length > MAX_ENVELOPE_LENGTH ||
    networkPassphrase.length > MAX_PASSPHRASE_LENGTH
  ) {
    return err("too_large");
  }

  if (SECRET_SEED.test(accountSnapshot) || SECRET_SEED.test(envelopeXdr)) {
    return err("invalid_input");
  }

  if (envelopeXdr.length % 4 !== 0 || !BASE64.test(envelopeXdr)) {
    return err("malformed_data");
  }

  return ok({ accountSnapshot, envelopeXdr, networkPassphrase });
}
