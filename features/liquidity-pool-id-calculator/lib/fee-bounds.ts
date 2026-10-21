import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode } from "../types";

/**
 * Basis-point bounds for a pool fee. Only 30 bps (0.30%) pools are actually
 * created by stellar-core today, but the hash format itself places no such
 * restriction — see the README's "non-obvious decision" for why this tool
 * validates the full protocol-level range rather than hardcoding 30.
 */
export const MIN_FEE_BPS = 0;
export const MAX_FEE_BPS = 10_000;

export function validateFeeBps(raw: string): Result<number, ErrorCode> {
  if (!/^\d+$/.test(raw)) return err("invalid_fee");
  const feeBps = Number(raw);
  if (!Number.isInteger(feeBps) || feeBps < MIN_FEE_BPS || feeBps > MAX_FEE_BPS) return err("invalid_fee");
  return ok(feeBps);
}
