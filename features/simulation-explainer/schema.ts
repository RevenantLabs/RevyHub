import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type {
  SimulationExplainerErrorCode,
  SimulationExplainerInput
} from "@/features/simulation-explainer/types";

/**
 * Parses raw form input into a validated transaction envelope XDR.
 *
 * The input must be a base64-encoded Stellar transaction envelope. The decode
 * step validates both the envelope structure and the inner transaction hash.
 */
export function parseSimulationExplainerInput(
  raw: string
): Result<SimulationExplainerInput, SimulationExplainerErrorCode> {
  const xdr = normalizeInput(raw);
  if (!xdr) return err("empty_input");

  if (!isValidTransactionEnvelope(xdr)) return err("invalid_xdr");

  return ok({ xdr });
}

function isValidTransactionEnvelope(value: string): boolean {
  try {
    xdr.TransactionEnvelope.fromXDR(value, "base64");
    return true;
  } catch {
    return false;
  }
}
