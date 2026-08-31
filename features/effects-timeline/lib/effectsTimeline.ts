import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { copy } from "@/features/effects-timeline/copy";
import { toEffectsTimelineErrorCode } from "@/features/effects-timeline/lib/effectsTimeline.errors";
import {
  formatAmountWithAsset,
  formatAsset,
  formatCanonicalAsset
} from "@/features/effects-timeline/lib/format";
import type {
  EffectCategory,
  EffectField,
  EffectsTimelineErrorCode,
  EffectsTimelineInput,
  EffectsTimelinePage,
  EffectsTimelineRequest,
  OperationGroup,
  TimelineEffect,
  TransactionGroup
} from "@/features/effects-timeline/types";

/** Effects shown per page. Horizon is asked for one more — see `loadEffectsPage`. */
export const PAGE_SIZE = 20;

/** `<operation TOID>-<effect index>`, both zero-padded decimal. */
const EFFECT_ID = /^(\d{1,19})-(\d{1,10})$/;
const INT64_MAX = (1n << 63n) - 1n;
const OPERATION_BITS = 12n;
const TRANSACTION_BITS = 20n;

/**
 * The subset of a Horizon effect record this tool reads.
 *
 * Every field is optional because the shape depends on `type`; the builders
 * below decide which ones a given type actually carries.
 */
export interface RawEffect {
  id: string;
  paging_token?: string;
  account?: string;
  type: string;
  created_at: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  asset?: string;
  starting_balance?: string;
  sold_amount?: string;
  sold_asset_type?: string;
  sold_asset_code?: string;
  sold_asset_issuer?: string;
  bought_amount?: string;
  bought_asset_type?: string;
  bought_asset_code?: string;
  bought_asset_issuer?: string;
  seller?: string;
  offer_id?: string | number;
  public_key?: string;
  weight?: number;
  limit?: string;
  trustor?: string;
  low_threshold?: number;
  med_threshold?: number;
  high_threshold?: number;
  home_domain?: string;
  auth_required_flag?: boolean;
  auth_revocable_flag?: boolean;
  auth_immutable_flag?: boolean;
  auth_clawback_enabled_flag?: boolean;
  name?: string;
  new_seq?: string | number;
  balance_id?: string;
  sponsor?: string;
  new_sponsor?: string;
  former_sponsor?: string;
  liquidity_pool?: { id?: string };
  contract?: string;
  inflation_destination?: string;
}

interface Collection<T> {
  _embedded?: { records?: T[] };
}

export interface EffectIdParts {
  operationId: string;
  transactionId: string;
  ledger: number;
  transactionIndex: number;
  operationIndex: number;
  effectIndex: number;
}

/**
 * Splits a Horizon effect id into the transaction and operation it belongs to.
 *
 * Effect records carry no transaction hash, but their id embeds the operation
 * TOID: ledger sequence in the high 32 bits, the transaction's application
 * order in the next 20, the operation's position in the low 12. Clearing the
 * operation bits therefore yields a stable identity for the transaction.
 *
 * The arithmetic is `BigInt` throughout: a TOID passes 2^53 at ledger ~2.1M,
 * so `Number` would start losing transactions to rounding.
 */
export function parseEffectId(id: string): EffectIdParts | null {
  const match = EFFECT_ID.exec(id);
  if (!match) return null;

  const toid = BigInt(match[1]);
  if (toid > INT64_MAX) return null;

  return {
    operationId: toid.toString(),
    transactionId: ((toid >> OPERATION_BITS) << OPERATION_BITS).toString(),
    ledger: Number(toid >> (OPERATION_BITS + TRANSACTION_BITS)),
    transactionIndex: Number((toid >> OPERATION_BITS) & ((1n << TRANSACTION_BITS) - 1n)),
    operationIndex: Number(toid & ((1n << OPERATION_BITS) - 1n)),
    effectIndex: Number(match[2])
  };
}

const BALANCE_EFFECTS = new Set([
  "account_created",
  "account_credited",
  "account_debited",
  "claimable_balance_created",
  "claimable_balance_claimed",
  "claimable_balance_clawed_back",
  "contract_credited",
  "contract_debited",
  "liquidity_pool_deposited",
  "liquidity_pool_withdrew",
  "liquidity_pool_trade",
  "trade"
]);

/**
 * Splits effects into the two kinds a reader cares about: value that moved,
 * and settings that changed.
 *
 * `account_removed` is deliberately a configuration change — merging an
 * account reports the transferred lumens separately as a debit and a credit,
 * so counting the removal as a balance change would double-count it.
 *
 * Unknown types fall back on evidence rather than a guess: an effect carrying
 * an amount moved value, whatever it is called.
 */
export function classifyEffect(raw: RawEffect): EffectCategory {
  if (BALANCE_EFFECTS.has(raw.type)) return "balance";
  if (raw.type.includes("sponsorship")) return "configuration";
  if (raw.amount !== undefined || raw.starting_balance !== undefined) return "balance";
  return "configuration";
}

function field(key: EffectField["key"], value: string, identifier = false): EffectField {
  return identifier ? { key, value, identifier: true } : { key, value };
}

function present(fields: (EffectField | null)[]): EffectField[] {
  return fields.filter((entry): entry is EffectField => entry !== null && entry.value !== "");
}

function amountField(
  key: EffectField["key"],
  amount: string | undefined,
  assetType?: string,
  assetCode?: string,
  assetIssuer?: string
): EffectField | null {
  if (amount === undefined) return null;
  return field(key, formatAmountWithAsset(amount, formatAsset(assetType, assetCode, assetIssuer)));
}

function identifierField(key: EffectField["key"], value?: string): EffectField | null {
  return value ? field(key, value, true) : null;
}

function flagSummary(raw: RawEffect): string {
  const flags: [string, boolean | undefined][] = [
    ["auth_required", raw.auth_required_flag],
    ["auth_revocable", raw.auth_revocable_flag],
    ["auth_immutable", raw.auth_immutable_flag],
    ["auth_clawback_enabled", raw.auth_clawback_enabled_flag]
  ];

  const described = flags
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${copy.flagLabels[name]} ${value ? copy.flagOn : copy.flagOff}`);

  return described.length ? described.join(", ") : copy.noFlags;
}

type FieldBuilder = (raw: RawEffect) => EffectField[];

const creditOrDebit: FieldBuilder = (raw) =>
  present([amountField("amount", raw.amount, raw.asset_type, raw.asset_code, raw.asset_issuer)]);

const trustlineEntry: FieldBuilder = (raw) =>
  present([
    field("asset", formatAsset(raw.asset_type, raw.asset_code, raw.asset_issuer)),
    amountField("trustLimit", raw.limit, raw.asset_type, raw.asset_code, raw.asset_issuer)
  ]);

const trustlineFlags: FieldBuilder = (raw) =>
  present([
    field("asset", formatAsset(raw.asset_type, raw.asset_code, raw.asset_issuer)),
    identifierField("trustor", raw.trustor)
  ]);

const signerEntry: FieldBuilder = (raw) =>
  present([
    identifierField("signerKey", raw.public_key),
    raw.weight === undefined ? null : field("signerWeight", String(raw.weight))
  ]);

const dataEntry: FieldBuilder = (raw) => present([raw.name ? field("dataName", raw.name) : null]);

const claimableBalance: FieldBuilder = (raw) =>
  present([
    raw.amount === undefined
      ? null
      : field("amount", formatAmountWithAsset(raw.amount, formatCanonicalAsset(raw.asset))),
    identifierField("balanceId", raw.balance_id)
  ]);

const liquidityPool: FieldBuilder = (raw) =>
  present([identifierField("liquidityPool", raw.liquidity_pool?.id)]);

const sponsorshipCreated: FieldBuilder = (raw) =>
  present([identifierField("sponsor", raw.sponsor)]);

const sponsorshipUpdated: FieldBuilder = (raw) =>
  present([
    identifierField("formerSponsor", raw.former_sponsor),
    identifierField("newSponsor", raw.new_sponsor)
  ]);

const sponsorshipRemoved: FieldBuilder = (raw) =>
  present([identifierField("formerSponsor", raw.former_sponsor)]);

const SPONSORSHIP_SUBJECTS = [
  "account",
  "trustline",
  "data",
  "claimable_balance",
  "signer"
] as const;

function sponsorshipBuilders(): Record<string, FieldBuilder> {
  const builders: Record<string, FieldBuilder> = {};

  for (const subject of SPONSORSHIP_SUBJECTS) {
    builders[`${subject}_sponsorship_created`] = sponsorshipCreated;
    builders[`${subject}_sponsorship_updated`] = sponsorshipUpdated;
    builders[`${subject}_sponsorship_removed`] = sponsorshipRemoved;
  }

  return builders;
}

/** Each effect type renders the fields Horizon actually attaches to it. */
const FIELD_BUILDERS: Record<string, FieldBuilder> = {
  ...sponsorshipBuilders(),

  account_created: (raw) =>
    present([amountField("startingBalance", raw.starting_balance, "native")]),
  account_credited: creditOrDebit,
  account_debited: creditOrDebit,
  contract_credited: (raw) =>
    present([
      amountField("amount", raw.amount, raw.asset_type, raw.asset_code, raw.asset_issuer),
      identifierField("contract", raw.contract)
    ]),
  contract_debited: (raw) =>
    present([
      amountField("amount", raw.amount, raw.asset_type, raw.asset_code, raw.asset_issuer),
      identifierField("contract", raw.contract)
    ]),

  account_home_domain_updated: (raw) =>
    present([field("homeDomain", raw.home_domain || copy.clearedValue)]),
  account_thresholds_updated: (raw) =>
    present([
      field(
        "thresholds",
        `${raw.low_threshold ?? 0} / ${raw.med_threshold ?? 0} / ${raw.high_threshold ?? 0}`
      )
    ]),
  account_flags_updated: (raw) => present([field("flags", flagSummary(raw))]),
  account_inflation_destination_updated: (raw) =>
    present([identifierField("inflationDestination", raw.inflation_destination)]),

  signer_created: signerEntry,
  signer_updated: signerEntry,
  signer_removed: signerEntry,

  trustline_created: trustlineEntry,
  trustline_updated: trustlineEntry,
  trustline_removed: trustlineEntry,
  trustline_authorized: trustlineFlags,
  trustline_deauthorized: trustlineFlags,
  trustline_authorized_to_maintain_liabilities: trustlineFlags,
  trustline_flags_updated: trustlineFlags,

  data_created: dataEntry,
  data_updated: dataEntry,
  data_removed: dataEntry,

  // A sequence number is a value to read, not an identifier to shorten: it is
  // rendered in full so it can be compared against the account's current one.
  sequence_bumped: (raw) =>
    present([raw.new_seq === undefined ? null : field("newSequence", String(raw.new_seq))]),

  claimable_balance_created: claimableBalance,
  claimable_balance_claimed: claimableBalance,
  claimable_balance_clawed_back: claimableBalance,
  claimable_balance_claimant_created: claimableBalance,

  liquidity_pool_created: liquidityPool,
  liquidity_pool_removed: liquidityPool,
  liquidity_pool_revoked: liquidityPool,
  liquidity_pool_deposited: liquidityPool,
  liquidity_pool_withdrew: liquidityPool,
  liquidity_pool_trade: liquidityPool,

  trade: (raw) =>
    present([
      amountField(
        "sold",
        raw.sold_amount,
        raw.sold_asset_type,
        raw.sold_asset_code,
        raw.sold_asset_issuer
      ),
      amountField(
        "bought",
        raw.bought_amount,
        raw.bought_asset_type,
        raw.bought_asset_code,
        raw.bought_asset_issuer
      ),
      identifierField("seller", raw.seller),
      raw.offer_id === undefined ? null : field("offerId", String(raw.offer_id), true)
    ])
};

/** Falls back to whatever recognisable fields an unmapped type happens to carry. */
const fallbackBuilder: FieldBuilder = (raw) =>
  present([
    amountField("amount", raw.amount, raw.asset_type, raw.asset_code, raw.asset_issuer),
    identifierField("sponsor", raw.sponsor),
    identifierField("newSponsor", raw.new_sponsor),
    identifierField("formerSponsor", raw.former_sponsor)
  ]);

export function buildEffectFields(raw: RawEffect): EffectField[] {
  return (FIELD_BUILDERS[raw.type] ?? fallbackBuilder)(raw);
}

export function normalizeEffect(raw: RawEffect): TimelineEffect | null {
  const parts = parseEffectId(raw.id);
  if (!parts) return null;

  return {
    id: raw.id,
    operationId: parts.operationId,
    transactionId: parts.transactionId,
    ledger: parts.ledger,
    transactionIndex: parts.transactionIndex,
    operationIndex: parts.operationIndex,
    effectIndex: parts.effectIndex,
    type: raw.type,
    category: classifyEffect(raw),
    createdAt: raw.created_at,
    fields: buildEffectFields(raw)
  };
}

/**
 * Normalises a page of records, refusing the whole page if any id is not a
 * Horizon effect id — grouping is derived from that id, so a page that cannot
 * be parsed cannot be grouped honestly.
 */
export function normalizeEffects(
  records: readonly RawEffect[]
): Result<TimelineEffect[], EffectsTimelineErrorCode> {
  const effects: TimelineEffect[] = [];

  for (const record of records) {
    const effect = normalizeEffect(record);
    if (!effect) return err("request_failed");
    effects.push(effect);
  }

  return ok(effects);
}

/** Ledger-application order: operation position first, then effect index. */
function compareChronologically(left: TimelineEffect, right: TimelineEffect): number {
  if (left.operationId !== right.operationId) {
    return BigInt(left.operationId) < BigInt(right.operationId) ? -1 : 1;
  }
  return left.effectIndex - right.effectIndex;
}

export interface GroupingBoundary {
  /** Transaction the newer page ended on. */
  continuedFrom?: string | null;
  /** Transaction whose remaining effects start the older page. */
  continuesInto?: string | null;
}

/**
 * Groups a page of effects by the transaction that caused them.
 *
 * Groups keep Horizon's newest-first order, while the effects inside a group
 * run oldest first — the order the ledger applied them, which is the only
 * order in which a chain of consequences reads correctly.
 */
export function groupEffectsByTransaction(
  effects: readonly TimelineEffect[],
  boundary: GroupingBoundary = {}
): TransactionGroup[] {
  const buckets = new Map<string, TimelineEffect[]>();

  for (const effect of effects) {
    const bucket = buckets.get(effect.transactionId);
    if (bucket) bucket.push(effect);
    else buckets.set(effect.transactionId, [effect]);
  }

  return [...buckets.entries()].map(([transactionId, bucketed]) => {
    const ordered = [...bucketed].sort(compareChronologically);
    const operations: OperationGroup[] = [];

    for (const effect of ordered) {
      const current = operations.at(-1);
      if (current && current.operationId === effect.operationId) {
        current.effects.push(effect);
      } else {
        operations.push({
          operationId: effect.operationId,
          operationIndex: effect.operationIndex,
          effects: [effect]
        });
      }
    }

    const first = ordered[0];
    return {
      transactionId,
      ledger: first.ledger,
      transactionIndex: first.transactionIndex,
      createdAt: first.createdAt,
      operations,
      effectCount: ordered.length,
      balanceEffectCount: ordered.filter((effect) => effect.category === "balance").length,
      configurationEffectCount: ordered.filter((effect) => effect.category === "configuration")
        .length,
      continuedFromNewerPage: boundary.continuedFrom === transactionId,
      continuesOnOlderPage: boundary.continuesInto === transactionId
    };
  });
}

export interface MultiEffectExample {
  ledger: number;
  transactionIndex: number;
  operationIndex: number;
  effectCount: number;
}

/**
 * Finds an operation on the page that produced more than one effect.
 *
 * The claim "one operation can produce several effects" is only convincing
 * with a case attached, so the timeline points at a real one from the data in
 * front of the reader instead of describing the idea in the abstract.
 */
export function findMultiEffectExample(
  groups: readonly TransactionGroup[]
): MultiEffectExample | null {
  for (const group of groups) {
    for (const operation of group.operations) {
      if (operation.effects.length > 1) {
        return {
          ledger: group.ledger,
          transactionIndex: group.transactionIndex,
          operationIndex: operation.operationIndex,
          effectCount: operation.effects.length
        };
      }
    }
  }

  return null;
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw Object.assign(new Error("Horizon request failed."), { status: response.status });
  }
  return (await response.json()) as T;
}

/**
 * Loads one page of `/accounts/{id}/effects?order=desc`.
 *
 * Horizon is asked for `PAGE_SIZE + 1` records and only `PAGE_SIZE` are shown.
 * The extra record is never rendered; it exists to answer two questions
 * exactly rather than by guesswork: whether an older page exists at all, and
 * whether the oldest transaction on this page continues into it.
 */
export async function loadEffectsPage(
  { accountId }: EffectsTimelineInput,
  network: StellarNetwork,
  request: EffectsTimelineRequest = {}
): Promise<Result<EffectsTimelinePage, EffectsTimelineErrorCode>> {
  try {
    const response = await requestJson<Collection<RawEffect>>(
      horizonUrl(network, `/accounts/${encodeURIComponent(accountId)}/effects`, {
        cursor: request.cursor,
        order: "desc",
        limit: PAGE_SIZE + 1
      }),
      request.signal
    );

    const records = response._embedded?.records ?? [];
    const visible = records.slice(0, PAGE_SIZE);
    const lookahead = records[PAGE_SIZE];

    const normalized = normalizeEffects(visible);
    if (!normalized.ok) return normalized;

    const effects = normalized.value;
    const oldest = effects.at(-1);

    let carryTransactionId: string | null = null;
    if (lookahead && oldest) {
      const parts = parseEffectId(lookahead.id);
      if (!parts) return err("request_failed");
      if (parts.transactionId === oldest.transactionId) {
        carryTransactionId = oldest.transactionId;
      }
    }

    const groups = groupEffectsByTransaction(effects, {
      continuedFrom: request.carryTransactionId ?? null,
      continuesInto: carryTransactionId
    });

    return ok({
      accountId,
      groups,
      effectCount: effects.length,
      hasOlder: Boolean(lookahead),
      olderCursor: lookahead
        ? visible.at(-1)?.paging_token ?? visible.at(-1)?.id ?? null
        : null,
      carryTransactionId
    });
  } catch (error) {
    return err(toEffectsTimelineErrorCode(error));
  }
}
