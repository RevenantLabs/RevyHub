import type { ErrorCode } from "../types";

/**
 * This slice makes no request — it decodes pasted XDR entirely in-process.
 * Anything unexpected escaping the decoder is treated as malformed input.
 */
export function unexpectedFailure(): ErrorCode {
  return "invalid_xdr";
}
