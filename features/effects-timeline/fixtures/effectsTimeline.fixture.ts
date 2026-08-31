import { Keypair } from "@stellar/stellar-sdk";
import type { RawEffect } from "@/features/effects-timeline/lib/effectsTimeline";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(31).publicKey();
export const quietAccountId = seed(32).publicKey();
export const unknownAccountId = seed(33).publicKey();
export const secretSeed = seed(34).secret();
export const counterparty = seed(35).publicKey();
export const issuer = seed(36).publicKey();
export const sponsor = seed(37).publicKey();
export const signerKey = seed(38).publicKey();

/**
 * Horizon identifies an operation by a TOID: ledger sequence in the high 32
 * bits, transaction application order in the next 20, operation position in
 * the low 12. Effect ids append the effect's own index.
 */
export function toid(ledger: number, transactionIndex: number, operationIndex: number): bigint {
  return (BigInt(ledger) << 32n) | (BigInt(transactionIndex) << 12n) | BigInt(operationIndex);
}

export function effectId(operation: bigint, effectIndex: number): string {
  return `${operation.toString().padStart(19, "0")}-${String(effectIndex).padStart(10, "0")}`;
}

const GENESIS = Date.parse("2026-04-01T00:00:00Z");
const LEDGER_SECONDS = 5;

function createdAt(ledger: number): string {
  return new Date(GENESIS + (ledger - 5_000_000) * LEDGER_SECONDS * 1000).toISOString();
}

function effect(
  ledger: number,
  transactionIndex: number,
  operationIndex: number,
  effectIndex: number,
  type: string,
  extra: Partial<RawEffect> = {}
): RawEffect {
  const id = effectId(toid(ledger, transactionIndex, operationIndex), effectIndex);
  return {
    id,
    paging_token: id,
    account: accountId,
    type,
    created_at: createdAt(ledger),
    ...extra
  };
}

const usdc = {
  asset_type: "credit_alphanum4",
  asset_code: "USDC",
  asset_issuer: issuer
} as const;

/**
 * Nine transactions of real history, oldest first.
 *
 * The account is created, trades, sets options, writes data and finally has a
 * trustline sponsored — enough variety that every rendering branch is
 * exercised, and enough effects that page one ends mid-transaction.
 */
export const ascendingEffects: RawEffect[] = [
  // Ledger 5,000,002 — the account is created and funded.
  effect(5_000_002, 1, 1, 1, "account_created", { starting_balance: "10000.0000000" }),

  // Ledger 5,000,003 — a path payment, an incoming payment and a data update.
  // This transaction straddles the page boundary.
  effect(5_000_003, 2, 1, 1, "account_debited", { amount: "250.5000000", asset_type: "native" }),
  effect(5_000_003, 2, 1, 2, "trade", {
    seller: counterparty,
    offer_id: "4451236",
    sold_amount: "250.5000000",
    sold_asset_type: "native",
    bought_amount: "91.4285714",
    bought_asset_type: usdc.asset_type,
    bought_asset_code: usdc.asset_code,
    bought_asset_issuer: usdc.asset_issuer
  }),
  effect(5_000_003, 2, 1, 3, "account_credited", { amount: "91.4285714", ...usdc }),
  effect(5_000_003, 2, 2, 1, "account_credited", { amount: "5.0000000", asset_type: "native" }),
  effect(5_000_003, 2, 3, 1, "data_updated", { name: "config.limit" }),

  // Ledger 5,000,004 — housekeeping.
  effect(5_000_004, 1, 1, 1, "trustline_removed", {
    asset_type: "credit_alphanum4",
    asset_code: "EURT",
    asset_issuer: issuer,
    limit: "0.0000000"
  }),
  effect(5_000_004, 1, 2, 1, "signer_removed", { public_key: signerKey, weight: 0 }),

  // Ledger 5,000,005 — a plain incoming payment.
  effect(5_000_005, 4, 1, 1, "account_credited", { amount: "1200.0000000", asset_type: "native" }),

  // Ledger 5,000,006 — one operation, two effects.
  effect(5_000_006, 1, 1, 1, "account_debited", { amount: "75.0000000", asset_type: "native" }),
  effect(5_000_006, 1, 1, 2, "claimable_balance_created", {
    balance_id: "00000000c1a2b3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6071829304152",
    amount: "75.0000000",
    asset: "native"
  }),

  // Ledger 5,000,007 — three operations, one effect each.
  effect(5_000_007, 1, 1, 1, "data_created", { name: "kyc.status" }),
  effect(5_000_007, 1, 2, 1, "sequence_bumped", { new_seq: "21474836480000000" }),
  effect(5_000_007, 1, 3, 1, "account_flags_updated", {
    auth_required_flag: true,
    auth_revocable_flag: false
  }),

  // Ledger 5,000,008 — a new trustline and a dust payment on it.
  effect(5_000_008, 2, 1, 1, "trustline_created", {
    ...usdc,
    limit: "922337203685.4775807"
  }),
  effect(5_000_008, 2, 2, 1, "account_credited", { amount: "0.0000001", ...usdc }),

  // Ledger 5,000,009 — one set_options operation, three configuration effects.
  effect(5_000_009, 1, 1, 1, "account_home_domain_updated", {
    home_domain: "revyhubx.example"
  }),
  effect(5_000_009, 1, 1, 2, "account_thresholds_updated", {
    low_threshold: 1,
    med_threshold: 2,
    high_threshold: 3
  }),
  effect(5_000_009, 1, 1, 3, "signer_created", { public_key: signerKey, weight: 2 }),

  // Ledger 5,000,010 — the newest transaction: a path payment plus sponsorship.
  effect(5_000_010, 3, 1, 1, "account_debited", { amount: "40.0000000", asset_type: "native" }),
  effect(5_000_010, 3, 1, 2, "trade", {
    seller: counterparty,
    offer_id: "4451901",
    sold_amount: "40.0000000",
    sold_asset_type: "native",
    bought_amount: "14.5000000",
    bought_asset_type: usdc.asset_type,
    bought_asset_code: usdc.asset_code,
    bought_asset_issuer: usdc.asset_issuer
  }),
  effect(5_000_010, 3, 1, 3, "account_credited", { amount: "14.5000000", ...usdc }),
  effect(5_000_010, 3, 2, 1, "trustline_sponsorship_created", {
    asset: `USDC:${issuer}`,
    sponsor
  })
];

/** Horizon's own ordering for this tool: newest effect first. */
export const descendingEffects: RawEffect[] = [...ascendingEffects].reverse();

/** The tool asks for 21 records and displays 20 — see `loadEffectsPage`. */
export const REQUESTED_PAGE_SIZE = 21;

export const pageOneRecords = descendingEffects.slice(0, REQUESTED_PAGE_SIZE);
export const pageTwoRecords = descendingEffects.slice(REQUESTED_PAGE_SIZE - 1);

/** Cursor Horizon is given for page two: the paging token of the 20th record. */
export const pageTwoCursor = descendingEffects[REQUESTED_PAGE_SIZE - 2].paging_token as string;

/** The transaction whose effects span the page boundary. */
export const straddlingTransactionId = ((toid(5_000_003, 2, 1) >> 12n) << 12n).toString();

export function effectsPage(records: RawEffect[]) {
  return {
    _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
    _embedded: { records }
  };
}

export const pageOneResponse = effectsPage(pageOneRecords);
export const pageTwoResponse = effectsPage(pageTwoRecords);
export const emptyResponse = effectsPage([]);

/** A page whose ids are not Horizon effect ids, so grouping cannot be derived. */
export const malformedResponse = effectsPage([
  {
    id: "not-an-effect-id",
    paging_token: "not-an-effect-id",
    account: accountId,
    type: "account_credited",
    created_at: createdAt(5_000_010),
    amount: "1.0000000",
    asset_type: "native"
  }
]);
