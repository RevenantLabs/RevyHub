import { err, ok, type Result } from "@/core/result/result";
import type { ContractDeployPreviewInput, ErrorCode } from "./types";

/**
 * Upper bound for pasted envelope text, matching `features/xdr-inspector`'s
 * cap — large enough for any real Soroban envelope, small enough that a
 * pasted file cannot lock the main thread inside the decoder.
 */
export const MAX_XDR_LENGTH = 65_536;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** Validates the pasted text before it reaches the decoder. */
export function parseInput(raw: string): Result<ContractDeployPreviewInput, ErrorCode> {
  const envelope = raw.replace(/\s+/g, "");

  if (!envelope) return err("empty_xdr");
  if (envelope.length > MAX_XDR_LENGTH) return err("too_large");
  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) return err("invalid_xdr");

  return ok({ envelope });
}
