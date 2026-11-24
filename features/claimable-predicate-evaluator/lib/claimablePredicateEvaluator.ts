import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { decodeJsonPredicate, decodePredicateXdr } from "@/features/claimable-predicate-evaluator/lib/predicate-tree";
import { evaluatePredicate } from "@/features/claimable-predicate-evaluator/lib/time-evaluation";
import type { DecisionNode, ErrorCode, EvaluatorInput, EvaluatorResult, Predicate } from "@/features/claimable-predicate-evaluator/types";

function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
function hasUnknown(node: DecisionNode): boolean { return node.verdict === "unknown" || !!node.children?.some(hasUnknown); }
interface BalanceData { predicate: Predicate | null; balanceId: string | null; amount: string | null; asset: string | null; sponsor: string | null; claimantCount: number }
function validAmount(value: unknown): value is string {
  if (typeof value !== "string" || !/^(0|[1-9]\d{0,11})(\.\d{1,7})?$/.test(value)) return false;
  const [whole, fraction = ""] = value.split(".");
  const stroops = BigInt(whole) * 10_000_000n + BigInt(fraction.padEnd(7, "0"));
  return stroops > 0n && stroops <= (1n << 63n) - 1n;
}
function validAsset(value: unknown): value is string {
  if (value === "native") return true;
  if (typeof value !== "string") return false;
  const match = /^([A-Za-z0-9]{1,12}):(G[A-Z2-7]{55})$/.exec(value);
  return !!match && StrKey.isValidEd25519PublicKey(match[2]);
}
function parseBalance(text: string, claimant: string): Result<BalanceData, ErrorCode> {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return err("malformed_data"); }
  if (!record(raw) || !Array.isArray(raw.claimants) || raw.claimants.length < 1) return err("malformed_data");
  if (raw.claimants.length > 10) return err("too_large");
  const id = raw.id === undefined ? null : raw.id;
  const amount = raw.amount === undefined ? null : raw.amount;
  const asset = raw.asset === undefined ? null : raw.asset;
  const sponsor = raw.sponsor === undefined ? null : raw.sponsor;
  if ((id !== null && (typeof id !== "string" || !/^0{7}0[0-9a-fA-F]{64}$/.test(id))) ||
      (amount !== null && !validAmount(amount)) ||
      (asset !== null && !validAsset(asset)) ||
      (sponsor !== null && (typeof sponsor !== "string" || !StrKey.isValidEd25519PublicKey(sponsor)))) return err("malformed_data");
  let selected: Predicate | null = null;
  const seen = new Set<string>();
  for (const item of raw.claimants) {
    if (!record(item) || typeof item.destination !== "string" || item.destination.startsWith("S") || !StrKey.isValidEd25519PublicKey(item.destination) || seen.has(item.destination)) return err("malformed_data");
    seen.add(item.destination);
    const decoded = decodeJsonPredicate(item.predicate);
    if (!decoded.ok) return decoded;
    if (item.destination === claimant) selected = decoded.value;
  }
  return ok({ predicate: selected, balanceId: id as string | null, amount: amount as string | null, asset: asset as string | null, sponsor: sponsor as string | null, claimantCount: raw.claimants.length });
}
/** Pure, offline evaluation of pasted evidence. */
export function runClaimablePredicateEvaluator(input: EvaluatorInput): Result<EvaluatorResult, ErrorCode> {
  const parsed = input.source === "predicate_xdr" ? decodePredicateXdr(input.text) : parseBalance(input.text, input.claimant);
  if (!parsed.ok) return parsed;
  const balance = input.source === "balance_json" ? parsed.value as BalanceData : null;
  const predicate = balance ? balance.predicate : parsed.value as Predicate;
  const tree = predicate ? evaluatePredicate(predicate, input) : null;
  const limitation = !tree ? "claimant_not_listed" : hasUnknown(tree) ? "missing_creation" : null;
  return ok({ source: input.source, claimant: input.claimant, evaluationTime: input.evaluationTime, evaluationSource: "user_supplied", creationTime: input.creationTime, creationSource: input.creationTime ? "user_supplied" : "unavailable",
    verdict: limitation ? "unknown" : tree?.verdict ?? "unknown", evidence: limitation ? "incomplete" : "complete", tree,
    balanceId: balance?.balanceId ?? null, amount: balance?.amount ?? null, asset: balance?.asset ?? null, sponsor: balance?.sponsor ?? null,
    claimantCount: balance?.claimantCount ?? null, limitation });
}
