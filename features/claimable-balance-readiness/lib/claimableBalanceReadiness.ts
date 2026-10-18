import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toClaimableBalanceReadinessErrorCode } from "@/features/claimable-balance-readiness/lib/claimableBalanceReadiness.errors";
import {
  evaluatePredicate,
  outcomeToVerdict
} from "@/features/claimable-balance-readiness/lib/claim-evaluator";
import {
  normalizePredicate,
  type HorizonPredicate
} from "@/features/claimable-balance-readiness/lib/predicate-tree";
import {
  resolveTimeContext,
  toTimeContextSummary,
  type EvaluationTimeContext
} from "@/features/claimable-balance-readiness/lib/time-context";
import type {
  ClaimableBalanceAsset,
  ClaimableBalanceReadinessErrorCode,
  ClaimableBalanceReadinessInput,
  ClaimableBalanceReadinessResult,
  ClaimantSummary,
  PredicateTreeNode,
  ReadinessVerdictKind
} from "@/features/claimable-balance-readiness/types";

export interface RawClaimant {
  destination: string;
  predicate: HorizonPredicate;
}

export interface RawClaimableBalance {
  id: string;
  asset: string;
  amount: string;
  sponsor?: string;
  last_modified_ledger: number;
  last_modified_time?: string;
  claimants: RawClaimant[];
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw Object.assign(new Error("Horizon request failed."), { status: response.status });
  }

  return (await response.json()) as T;
}

export function parseAsset(asset: string): ClaimableBalanceAsset {
  if (asset === "native") {
    return { kind: "native", label: "XLM (native)" };
  }

  const [assetCode, assetIssuer] = asset.split(":");
  return {
    kind: "credit",
    assetCode: assetCode ?? asset,
    assetIssuer,
    label: assetIssuer ? `${assetCode}:${assetIssuer}` : asset
  };
}

function buildClaimantSummary(
  claimant: RawClaimant,
  selected: boolean,
  context: EvaluationTimeContext
): Result<ClaimantSummary, ClaimableBalanceReadinessErrorCode> {
  const normalized = normalizePredicate(claimant.predicate);
  if (!normalized.ok) {
    return err("unsupported_predicate");
  }

  const tree: PredicateTreeNode = evaluatePredicate(normalized.value, context);
  const verdict: ReadinessVerdictKind = outcomeToVerdict(tree.outcome);

  return ok({
    destination: claimant.destination,
    selected,
    verdict,
    predicateTree: tree
  });
}

export function evaluateBalanceReadiness(
  record: RawClaimableBalance,
  input: ClaimableBalanceReadinessInput
): Result<ClaimableBalanceReadinessResult, ClaimableBalanceReadinessErrorCode> {
  const timeResult = resolveTimeContext(input.evaluationTime, record.last_modified_time);
  if (!timeResult.ok) {
    return err(timeResult.code);
  }

  const context = timeResult.value;
  const claimants: ClaimantSummary[] = [];
  let selectedSummary: ClaimantSummary | null = null;

  for (const claimant of record.claimants) {
    const isSelected = claimant.destination === input.claimant;
    const summary = buildClaimantSummary(claimant, isSelected, context);
    if (!summary.ok) {
      // Only fail hard when the selected claimant has an unsupported predicate.
      if (isSelected) return err(summary.code);
      claimants.push({
        destination: claimant.destination,
        selected: false,
        verdict: "indeterminate",
        predicateTree: null
      });
      continue;
    }
    claimants.push(summary.value);
    if (isSelected) selectedSummary = summary.value;
  }

  const selectedVerdict: ReadinessVerdictKind = selectedSummary
    ? selectedSummary.verdict
    : "not_listed";

  return ok({
    balanceId: record.id,
    amount: record.amount,
    asset: parseAsset(record.asset),
    sponsor: record.sponsor,
    lastModifiedLedger: record.last_modified_ledger,
    timeContext: toTimeContextSummary(context),
    selectedClaimant: input.claimant,
    selectedVerdict,
    selectedTree: selectedSummary?.predicateTree ?? null,
    claimants
  });
}

/** Fetch one claimable balance and evaluate the named claimant at the selected time. */
export async function runClaimableBalanceReadiness(
  input: ClaimableBalanceReadinessInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<ClaimableBalanceReadinessResult, ClaimableBalanceReadinessErrorCode>> {
  try {
    const record = await requestJson<RawClaimableBalance>(
      horizonUrl(network, `/claimable_balances/${encodeURIComponent(input.balanceId)}`),
      signal
    );

    return evaluateBalanceReadiness(record, input);
  } catch (error) {
    return err(toClaimableBalanceReadinessErrorCode(error));
  }
}
