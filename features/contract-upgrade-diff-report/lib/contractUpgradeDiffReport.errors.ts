import { err, ok, type Result } from "@/core/result/result";
import type {
  UpgradeErrorCode,
  UpgradeErrorDetail,
  UpgradeSide
} from "@/features/contract-upgrade-diff-report/types";

/** The two ways a section's XDR can fail to decode. */
export type DecodeFailure = "malformed_data" | "unsupported_variant";

/**
 * Raised by this slice's own decoders for a value the installed SDK decoded
 * but this tool has no rendering for, so it is reported as unsupported rather
 * than guessed at.
 */
export class UnsupportedVariantError extends Error {
  constructor(what: string) {
    super(`unsupported variant: ${what}`);
    this.name = "UnsupportedVariantError";
  }
}

/**
 * Maps a thrown decode failure onto the two outcomes the UI can explain.
 *
 * The SDK's XDR reader reports an enum discriminant it does not know as
 * "unknown <Enum> member for value N". That is what a newer protocol's entry
 * kind (for example a spec entry kind added after the installed SDK) looks
 * like, so it is `unsupported_variant`. Everything else — a read past the end,
 * bad padding, a string over its declared bound, exhausted recursion on a
 * hostile nesting depth — is `malformed_data`.
 */
export function classifyDecodeFailure(error: unknown): DecodeFailure {
  if (error instanceof UnsupportedVariantError) return "unsupported_variant";
  const message = error instanceof Error ? error.message : String(error);
  if (/unknown \w+ member for value/.test(message) || /Bad union switch/.test(message)) {
    return "unsupported_variant";
  }
  return "malformed_data";
}

/**
 * Reads an uploaded file into bytes. This slice makes no request, so the only
 * "transport" is the browser's file reader; a failure there is `read_failed`.
 */
export async function readUploadBytes(
  file: File,
  side: UpgradeSide
): Promise<Result<Uint8Array, UpgradeErrorCode, UpgradeErrorDetail>> {
  try {
    return ok(new Uint8Array(await file.arrayBuffer()));
  } catch {
    return err("read_failed", { side });
  }
}

/** Codes that describe what was selected rather than what the binary contains. */
const INPUT_CODES: readonly UpgradeErrorCode[] = ["invalid_input", "too_large", "read_failed"];

export function isInputProblem(code: UpgradeErrorCode): boolean {
  return INPUT_CODES.includes(code);
}
