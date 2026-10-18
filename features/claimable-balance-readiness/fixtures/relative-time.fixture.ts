import type { HorizonPredicate } from "@/features/claimable-balance-readiness/lib/predicate-tree";
import type { RawClaimableBalance } from "@/features/claimable-balance-readiness/lib/claimableBalanceReadiness";
import {
  claimantAccount,
  noCreationBalanceId,
  relativeOnlyBalanceId
} from "@/features/claimable-balance-readiness/fixtures/claimableBalanceReadiness.fixture";

/** Fixed creation and evaluation anchors for relative-time tests. */
export const creationIso = "2026-05-02T10:14:05Z";
export const creationMs = Date.parse(creationIso);

/** 30 minutes after creation — inside a 1-hour rel_before / outside rel_after 1h. */
export const evaluationInsideHour = "2026-05-02T10:44:05Z";

/** 2 hours after creation — outside rel_before 1h / inside rel_after 1h. */
export const evaluationAfterTwoHours = "2026-05-02T12:14:05Z";

export const relBeforeOneHour: HorizonPredicate = { rel_before: "3600" };
export const relAfterOneHour: HorizonPredicate = { rel_after: "3600" };
export const relBeforeOneDay: HorizonPredicate = { rel_before: "86400" };

export const relativeWithCreationBalance: RawClaimableBalance = {
  id: relativeOnlyBalanceId,
  asset: "native",
  amount: "10.0000000",
  last_modified_ledger: 2000000,
  last_modified_time: creationIso,
  claimants: [
    {
      destination: claimantAccount,
      predicate: relAfterOneHour
    }
  ]
};

export const relativeWithoutCreationBalance: RawClaimableBalance = {
  id: noCreationBalanceId,
  asset: "native",
  amount: "3.0000000",
  last_modified_ledger: 2000001,
  claimants: [
    {
      destination: claimantAccount,
      predicate: relBeforeOneDay
    }
  ]
};
