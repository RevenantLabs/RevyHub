import { Keypair } from "@stellar/stellar-sdk";
import type {
  HorizonMergeAccount,
  HorizonOffer
} from "@/features/account-merge-preflight/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const sourceAccountId = seed(31).publicKey();
export const destinationAccountId = seed(32).publicKey();
export const issuerAccountId = seed(33).publicKey();
export const alternateSignerId = seed(34).publicKey();
export const unknownSourceAccountId = seed(35).publicKey();
export const unknownDestinationAccountId = seed(36).publicKey();
export const secretSeed = seed(37).secret();

function account(
  accountId: string,
  overrides: Partial<HorizonMergeAccount> = {}
): HorizonMergeAccount {
  return {
    account_id: accountId,
    balances: [
      {
        asset_type: "native",
        balance: "25.5000000",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000"
      }
    ],
    data: {},
    flags: { auth_immutable: false },
    thresholds: { high_threshold: 1 },
    signers: [{ key: accountId, weight: 1 }],
    num_sponsoring: 0,
    num_sponsored: 0,
    ...overrides
  };
}

export const mergeableSourceAccount = account(sourceAccountId, { num_sponsored: 2 });

export const destinationAccount = account(destinationAccountId, {
  balances: [
    {
      asset_type: "native",
      balance: "100.0000000",
      buying_liabilities: "3.0000000",
      selling_liabilities: "0.0000000"
    }
  ]
});

export const blockedSourceAccount = account(sourceAccountId, {
  balances: [
    {
      asset_type: "native",
      balance: "25.5000000",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    },
    {
      asset_type: "credit_alphanum4",
      asset_code: "USD",
      asset_issuer: issuerAccountId,
      balance: "7.2500000"
    },
    {
      asset_type: "liquidity_pool_shares",
      liquidity_pool_id: "a".repeat(64),
      balance: "1.0000000"
    }
  ],
  data: { invoice: "aW52b2ljZQ==", profile: "cHJvZmlsZQ==" },
  flags: { auth_immutable: true },
  thresholds: { high_threshold: 10 },
  signers: [
    { key: sourceAccountId, weight: 3 },
    { key: alternateSignerId, weight: 2 }
  ],
  num_sponsoring: 2,
  num_sponsored: 3
});

export const offers: HorizonOffer[] = [
  {
    id: "101",
    paging_token: "101",
    selling: { asset_type: "native" },
    buying: { asset_type: "credit_alphanum4", asset_code: "USD", asset_issuer: issuerAccountId }
  },
  {
    id: "102",
    paging_token: "102",
    selling: { asset_type: "credit_alphanum4", asset_code: "USD", asset_issuer: issuerAccountId },
    buying: { asset_type: "native" }
  }
];

export const capacityLimitedDestination = account(destinationAccountId, {
  balances: [
    {
      asset_type: "native",
      balance: "922337203680.0000000",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    }
  ]
});

export function offerPage(records: HorizonOffer[]) {
  return {
    _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
    _embedded: { records }
  };
}
