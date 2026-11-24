import { err, ok, type Result } from "@/core/result/result";
import type {
  RawUpgradeFiles,
  UpgradeErrorCode,
  UpgradeErrorDetail,
  UpgradeSide,
  ValidatedUpgradeFiles,
  WasmUpload
} from "@/features/contract-upgrade-diff-report/types";

/** Each uploaded binary is bounded to exactly 1 MiB, inclusive. */
export const MAX_WASM_BYTES = 1_048_576;

/** File names are displayed, so they are bounded like any other uploaded text. */
export const MAX_FILE_NAME_LENGTH = 120;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix and length alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

const WASM_MAGIC = [0x00, 0x61, 0x73, 0x6d] as const;

type SchemaResult<T> = Result<T, UpgradeErrorCode, UpgradeErrorDetail>;

function fail(code: UpgradeErrorCode, side: UpgradeSide) {
  return err(code, { side });
}

function checkFile(file: File | null): UpgradeErrorCode | null {
  if (!file || file.size === 0) return "invalid_input";
  // Size is checked before any read so an oversized file is never held in memory.
  if (file.size > MAX_WASM_BYTES) return "too_large";
  return null;
}

/**
 * Validates presence and the 1 MiB bound of both uploads before a byte is read.
 * The old file is checked first so the message names one concrete thing to fix.
 */
export function validateUpgradeFiles(raw: RawUpgradeFiles): SchemaResult<ValidatedUpgradeFiles> {
  const oldProblem = checkFile(raw.oldFile);
  if (oldProblem) return fail(oldProblem, "old");

  const newProblem = checkFile(raw.newFile);
  if (newProblem) return fail(newProblem, "new");

  return ok({ oldFile: raw.oldFile as File, newFile: raw.newFile as File });
}

/**
 * Reduces an uploaded file name to bounded, inert display text.
 *
 * A name shaped like a secret seed is never echoed back, and control
 * characters are dropped so a crafted name cannot reflow the report.
 */
export function displayFileName(name: string, side: UpgradeSide): string {
  const fallback = side === "old" ? "old.wasm" : "new.wasm";
  const cleaned = name.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!cleaned || SECRET_SEED.test(cleaned.replace(/\.[^.]*$/, ""))) return fallback;
  return cleaned.length > MAX_FILE_NAME_LENGTH
    ? `${cleaned.slice(0, MAX_FILE_NAME_LENGTH)}…`
    : cleaned;
}

/** True when the bytes are a text upload that holds nothing but a secret seed. */
export function looksLikeSecretSeed(bytes: Uint8Array): boolean {
  if (bytes.length > 128) return false;
  let text = "";
  for (const byte of bytes) {
    if (byte > 0x7e) return false;
    text += String.fromCharCode(byte);
  }
  return SECRET_SEED.test(text.trim());
}

/**
 * Re-checks what was actually read, before any decoding.
 *
 * The bound is enforced again on the real byte count rather than trusting the
 * `File.size` reported earlier. A secret seed saved to a file is refused on
 * shape alone and its bytes are not kept.
 */
export function parseWasmUpload(
  bytes: Uint8Array,
  rawName: string,
  side: UpgradeSide
): SchemaResult<WasmUpload> {
  if (bytes.length === 0) return fail("invalid_input", side);
  if (bytes.length > MAX_WASM_BYTES) return fail("too_large", side);
  if (looksLikeSecretSeed(bytes)) return fail("invalid_input", side);
  return ok({ side, fileName: displayFileName(rawName, side), bytes });
}

/** True when the first four bytes are the Wasm magic number `\0asm`. */
export function hasWasmMagic(bytes: Uint8Array): boolean {
  return WASM_MAGIC.every((byte, index) => bytes[index] === byte);
}
