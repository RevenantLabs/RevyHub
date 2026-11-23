import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, EvaluatorInput } from "@/features/claimable-predicate-evaluator/types";

export const MAX_JSON_LENGTH = 100_000;
export const MAX_XDR_LENGTH = 16_384;
const SEED = /\bS[A-Z2-7]{1,55}\b/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
export interface RawInput {
  source: "balance_json" | "predicate_xdr";
  text: string;
  claimant: string;
  evaluationTime: string;
  creationTime: string;
}
function instant(value: string): { seconds: bigint; iso: string } | null {
  if (!INSTANT.test(value)) return null;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms) || ms < 0 || new Date(ms).toISOString().replace(".000Z", "Z") !== value) return null;
  return { seconds: BigInt(ms / 1000), iso: value };
}
export function parseInput(raw: RawInput): Result<EvaluatorInput, ErrorCode> {
  if (raw.source !== "balance_json" && raw.source !== "predicate_xdr") return err("invalid_input");
  const text = raw.text.trim();
  const claimant = raw.claimant.trim();
  if (SEED.test(raw.text) || claimant.startsWith("S")) return err("invalid_input");
  if (text.length > (raw.source === "predicate_xdr" ? MAX_XDR_LENGTH : MAX_JSON_LENGTH)) return err("too_large");
  if (!text || !StrKey.isValidEd25519PublicKey(claimant)) return err("invalid_input");
  const evaluation = instant(raw.evaluationTime.trim());
  const creation = raw.creationTime.trim() ? instant(raw.creationTime.trim()) : null;
  if (!evaluation || (raw.creationTime.trim() && !creation)) return err("invalid_input");
  if (creation && creation.seconds > evaluation.seconds) return err("invalid_input");
  if (raw.source === "predicate_xdr" && (!/^[A-Za-z0-9+/]+={0,2}$/.test(text) || text.length % 4)) return err("malformed_data");
  return ok({ source: raw.source, text, claimant, evaluationSeconds: evaluation.seconds, evaluationTime: evaluation.iso, creationSeconds: creation?.seconds ?? null, creationTime: creation?.iso ?? null });
}
