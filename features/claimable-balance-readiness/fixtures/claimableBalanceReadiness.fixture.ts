import { Keypair } from "@stellar/stellar-sdk";
import type { ClaimableBalanceReadinessResult } from "@/features/claimable-balance-readiness/types";
import type { RawClaimableBalance } from "@/features/claimable-balance-readiness/lib/claimableBalanceReadiness";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const claimantAccount = seed(11).publicKey();
export const otherClaimant = seed(12).publicKey();
export const outsiderAccount = seed(13).publicKey();
export const sponsorAccount = seed(14).publicKey();
export const assetIssuer = seed(15).publicKey();

export const balanceId = "c".repeat(64);
export const missingBalanceId = "d".repeat(64);
export const relativeOnlyBalanceId = "e".repeat(64);
export const noCreationBalanceId = "f".repeat(64);
export const unsupportedBalanceId = "1".repeat(64);

export const evaluationTime = "2026-06-01T12:00:00Z";

export const nestedPredicateBalance: RawClaimableBalance = {
  id: balanceId,
  asset: `USDC:${assetIssuer}`,
  amount: "125.5000000",
  sponsor: sponsorAccount,
  last_modified_ledger: 1017696,
  last_modified_time: "2026-05-02T10:14:05Z",
  claimants: [
    {
      destination: claimantAccount,
      predicate: { unconditional: true }
    },
    {
      destination: otherClaimant,
      predicate: {
        or: [
          {
            and: [
              { not: { abs_before: "2027-01-01T00:00:00Z", abs_before_epoch: "1798761600" } },
              { rel_before: "86400" }
            ]
          },
          { abs_after: "2026-01-01T00:00:00Z", abs_after_epoch: "1767225600" }
        ]
      }
    }
  ]
};

export const relativeOnlyBalance: RawClaimableBalance = {
  id: relativeOnlyBalanceId,
  asset: "native",
  amount: "10.0000000",
  last_modified_ledger: 2000000,
  last_modified_time: "2026-05-02T10:14:05Z",
  claimants: [
    {
      destination: claimantAccount,
      predicate: { rel_after: "3600" }
    }
  ]
};

/** Relative predicate with no creation timestamp — must yield indeterminate. */
export const noCreationContextBalance: RawClaimableBalance = {
  id: noCreationBalanceId,
  asset: "native",
  amount: "3.0000000",
  last_modified_ledger: 2000001,
  claimants: [
    {
      destination: claimantAccount,
      predicate: { rel_before: "86400" }
    }
  ]
};

export const unsupportedPredicateBalance: RawClaimableBalance = {
  id: unsupportedBalanceId,
  asset: "native",
  amount: "1.0000000",
  last_modified_ledger: 2000002,
  last_modified_time: "2026-05-02T10:14:05Z",
  claimants: [
    {
      destination: claimantAccount,
      // Empty and-array is not a supported shape.
      predicate: { and: [] } as RawClaimableBalance["claimants"][0]["predicate"]
    }
  ]
};

export const claimableBalanceReadinessFixture: ClaimableBalanceReadinessResult = {
  balanceId,
  amount: "125.5000000",
  asset: {
    kind: "credit",
    assetCode: "USDC",
    assetIssuer,
    label: `USDC:${assetIssuer}`
  },
  sponsor: sponsorAccount,
  lastModifiedLedger: 1017696,
  timeContext: {
    evaluationTime,
    evaluationTimeMs: Date.parse(evaluationTime),
    creationTime: "2026-05-02T10:14:05Z",
    creationTimeMs: Date.parse("2026-05-02T10:14:05Z"),
    creationReliable: true,
    creationSource: "last_modified_time"
  },
  selectedClaimant: claimantAccount,
  selectedVerdict: "eligible",
  selectedTree: {
    kind: "unconditional",
    label: "can be claimed at any time",
    outcome: "satisfied",
    explanation: "Unconditional predicates are always claimable."
  },
  claimants: [
    {
      destination: claimantAccount,
      selected: true,
      verdict: "eligible",
      predicateTree: {
        kind: "unconditional",
        label: "can be claimed at any time",
        outcome: "satisfied",
        explanation: "Unconditional predicates are always claimable."
      }
    },
    {
      destination: otherClaimant,
      selected: false,
      verdict: "eligible",
      predicateTree: null
    }
  ]
};
