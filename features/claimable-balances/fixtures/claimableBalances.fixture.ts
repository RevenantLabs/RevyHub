import { Keypair } from "@stellar/stellar-sdk";
import type { ClaimableBalancesResult } from "@/features/claimable-balances/types";
import type { RawClaimableBalance } from "@/features/claimable-balances/lib/claimableBalances";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const claimantAccount = seed(1).publicKey();
export const otherClaimant = seed(2).publicKey();
export const sponsorAccount = seed(3).publicKey();
export const assetIssuer = seed(4).publicKey();

export const balanceId = "a".repeat(64);
export const missingBalanceId = "b".repeat(64);

export const nestedPredicateBalance: RawClaimableBalance = {
  id: balanceId,
  asset: `USDC:${assetIssuer}`,
  amount: "125.5000000",
  sponsor: sponsorAccount,
  last_modified_ledger: 1017696,
  last_modified_time: "2026-05-02T10:14:05Z",
  paging_token: `1017696-${balanceId}`,
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

export const claimantListPage = {
  _links: {
    self: { href: "" },
    next: { href: "" },
    prev: { href: "" }
  },
  _embedded: {
    records: [nestedPredicateBalance]
  }
};

export const emptyClaimantListPage = {
  _links: {
    self: { href: "" },
    next: { href: "" },
    prev: { href: "" }
  },
  _embedded: {
    records: [] as RawClaimableBalance[]
  }
};

export const claimableBalancesFixture: ClaimableBalancesResult = {
  mode: "balance",
  query: balanceId,
  balances: [
    {
      id: balanceId,
      amount: "125.5000000",
      asset: {
        kind: "credit",
        assetCode: "USDC",
        assetIssuer,
        label: `USDC:${assetIssuer}`
      },
      sponsor: sponsorAccount,
      lastModifiedLedger: 1017696,
      fundedAt: "2026-05-02T10:14:05Z",
      claimants: [
        {
          destination: claimantAccount,
          predicateText: "can be claimed at any time",
          claimableNow: true
        },
        {
          destination: otherClaimant,
          predicateText:
            "not (before 2027-01-01 00:00:00 UTC) and within 1 day after the balance was created or from 2026-01-01 00:00:00 UTC onward",
          claimableNow: true
        }
      ]
    }
  ]
};
