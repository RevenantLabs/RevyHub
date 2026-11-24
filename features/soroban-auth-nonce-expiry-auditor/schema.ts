import { err, ok, type Result } from "@/core/result/result";
import type { AuditErrorCode, AuditInput } from "./types";

export const MAX_ENTRIES = 50;
export const MAX_INPUT_LENGTH = 131072;
export const MAX_ENTRY_LENGTH = 16384;
export const MAX_PASSPHRASE_LENGTH = 256;
const MAX_LEDGER_LENGTH = 20;
const UINT32_MAX = 0xffffffff;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const SECRET_SEED = /S[A-Z2-7]{55}/;

export interface RawAuditInput { bundle: string; networkPassphrase: string; evaluationLedger: string }

/**
 * Every SorobanAuthorizationEntry XDR starts with a 4-byte credential
 * discriminant (0 or 1), so its base64 begins with "AAAA" and never with "S".
 * A bundle token that starts with "S" is therefore rejected on the prefix
 * alone, before any checksum check. Other fields reject any strkey-shaped
 * seeds. Matching anywhere inside a base64 line would reject valid XDR.
 */
export function containsSecretSeed(raw: RawAuditInput): boolean {
  const bundleTokens = raw.bundle.split(/\s+/).filter(Boolean);
  return bundleTokens.some((token) => token.startsWith("S")) ||
    SECRET_SEED.test(raw.networkPassphrase) || SECRET_SEED.test(raw.evaluationLedger);
}

export function parseAuditInput(raw: RawAuditInput): Result<AuditInput, AuditErrorCode> {
  if (raw.bundle.length > MAX_INPUT_LENGTH || raw.networkPassphrase.length > MAX_PASSPHRASE_LENGTH || raw.evaluationLedger.length > MAX_LEDGER_LENGTH) return err("too_large");
  if (containsSecretSeed(raw)) return err("invalid_input");
  const entries = raw.bundle.trim().split(/\r?\n/).map((line) => line.trim());
  if (!raw.bundle.trim() || !raw.networkPassphrase.trim() || entries.some((line) => !line)) return err("invalid_input");
  if (entries.length > MAX_ENTRIES || entries.some((line) => line.length > MAX_ENTRY_LENGTH)) return err("too_large");
  if (entries.some((line) => !BASE64.test(line))) return err("invalid_input");
  const ledgerText = raw.evaluationLedger.trim();
  if (ledgerText && !/^(0|[1-9][0-9]*)$/.test(ledgerText)) return err("invalid_input");
  const evaluationLedger = ledgerText ? Number(ledgerText) : null;
  if (evaluationLedger !== null && evaluationLedger > UINT32_MAX) return err("invalid_input");
  return ok({ entries, networkPassphrase: raw.networkPassphrase.trim(), evaluationLedger });
}
