import { err, ok, type Result } from "@/core/result/result";
import type {
  SorobanFeeEstimatorErrorCode,
  SorobanFeeEstimatorInput,
} from "@/features/soroban-fee-estimator/types";

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
const MAX_XDR_LENGTH = 65_536;

/** Validates the pasted envelope before it reaches the decoder. */
export function parseSorobanFeeEstimatorInput(
  raw: string
): Result<SorobanFeeEstimatorInput, SorobanFeeEstimatorErrorCode> {
  const envelope = raw.replace(/\s+/g, "");

  if (!envelope) return err("empty_input");
  if (envelope.length > MAX_XDR_LENGTH) return err("invalid_xdr");
  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) return err("invalid_xdr");

  return ok({ envelope });
}
