import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toSponsoredReservesErrorCode } from "@/features/sponsored-reserves/lib/sponsoredReserves.errors";
import type {
  SponsoredEntry,
  SponsoredEntryKind,
  SponsoredReservesErrorCode,
  SponsoredReservesInput,
  SponsoredReservesResult
} from "@/features/sponsored-reserves/types";

const PAGE_SIZE = 200;

/**
 * Newest-first page budget for reconstructing data-entry sponsorship.
 *
 * Effects are account history, not current state, so this walk is bounded:
 * a data entry that has never been sponsored produces no sponsorship effect
 * at all, and without a cap the walk would run to the start of the account.
 */
const MAX_EFFECT_PAGES = 5;

export interface RawBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  liquidity_pool_id?: string;
  sponsor?: string;
}

export interface RawSigner {
  key: string;
  sponsor?: string;
}

export interface RawAccount {
  account_id: string;
  /** Present when another account pays this account's own entry reserve. */
  sponsor?: string;
  balances: RawBalance[];
  signers: RawSigner[];
  data: Record<string, string>;
  num_sponsoring: number;
  num_sponsored: number;
}

export interface RawOffer {
  id: string | number;
  paging_token: string;
  sponsor?: string;
}

export interface RawEffect {
  type: string;
  paging_token: string;
  data_name?: string;
  sponsor?: string;
  new_sponsor?: string;
}

interface RawLedger {
  base_reserve_in_stroops: string | number;
}

interface Collection<T> {
  _embedded: { records: T[] };
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

async function collectRecords<T extends { paging_token: string }>(
  network: StellarNetwork,
  pathname: string,
  signal?: AbortSignal
): Promise<T[]> {
  const records: T[] = [];
  let cursor: string | undefined;

  while (true) {
    const page = await requestJson<Collection<T>>(
      horizonUrl(network, pathname, {
        cursor,
        limit: PAGE_SIZE,
        order: "asc"
      }),
      signal
    );
    const nextRecords = page._embedded.records;
    records.push(...nextRecords);

    if (nextRecords.length < PAGE_SIZE) return records;

    const nextCursor = nextRecords.at(-1)?.paging_token;
    if (!nextCursor || nextCursor === cursor) {
      throw new Error("Horizon pagination did not advance.");
    }
    cursor = nextCursor;
  }
}

/**
 * Decides the current sponsor of each still-undecided data entry from a page
 * of **newest-first** effects. The first effect that mentions an entry wins,
 * so the entry is removed from `pending` and never revisited on older pages.
 */
export function applyLatestDataSponsorship(
  effects: readonly RawEffect[],
  pending: Set<string>,
  sponsors: Map<string, string>
): void {
  for (const effect of effects) {
    const name = effect.data_name;
    if (!name || !pending.has(name)) continue;

    switch (effect.type) {
      case "data_sponsorship_created":
        if (!effect.sponsor) continue;
        sponsors.set(name, effect.sponsor);
        break;
      case "data_sponsorship_updated":
        if (!effect.new_sponsor) continue;
        sponsors.set(name, effect.new_sponsor);
        break;
      // The entry exists but its most recent event left it unsponsored. A
      // `data_removed` matters too: the current entry of that name was created
      // afterwards, so any older sponsorship effect belongs to a dead entry.
      case "data_sponsorship_removed":
      case "data_removed":
        break;
      default:
        continue;
    }

    pending.delete(name);
  }
}

async function loadDataSponsors(
  network: StellarNetwork,
  accountId: string,
  dataNames: readonly string[],
  signal?: AbortSignal
): Promise<Map<string, string>> {
  const pending = new Set(dataNames);
  const sponsors = new Map<string, string>();
  let cursor: string | undefined;

  for (let page = 0; page < MAX_EFFECT_PAGES && pending.size; page += 1) {
    const response = await requestJson<Collection<RawEffect>>(
      horizonUrl(network, `/accounts/${encodeURIComponent(accountId)}/effects`, {
        cursor,
        limit: PAGE_SIZE,
        order: "desc"
      }),
      signal
    );
    const records = response._embedded.records;
    applyLatestDataSponsorship(records, pending, sponsors);

    if (records.length < PAGE_SIZE) break;

    const nextCursor = records.at(-1)?.paging_token;
    if (!nextCursor || nextCursor === cursor) break;
    cursor = nextCursor;
  }

  return sponsors;
}

function trustlineReference(balance: RawBalance): string {
  if (balance.asset_type === "liquidity_pool_shares") {
    return balance.liquidity_pool_id ?? "";
  }
  return `${balance.asset_code ?? ""}:${balance.asset_issuer ?? ""}`;
}

/**
 * Collapses the four shapes Horizon carries a `sponsor` on — plus the account
 * entry itself — into one row type, the way `normalizeBalance` does.
 */
export function normalizeSponsoredEntries(
  account: RawAccount,
  offers: readonly RawOffer[],
  dataSponsors: ReadonlyMap<string, string>
): SponsoredEntry[] {
  const entries: SponsoredEntry[] = [];

  if (account.sponsor) {
    entries.push({
      id: `account:${account.account_id}`,
      kind: "account",
      reference: account.account_id,
      sponsor: account.sponsor
    });
  }

  for (const balance of account.balances) {
    if (!balance.sponsor) continue;
    const reference = trustlineReference(balance);
    entries.push({
      id: `trustline:${reference}`,
      kind: "trustline",
      reference,
      sponsor: balance.sponsor
    });
  }

  for (const signer of account.signers) {
    if (!signer.sponsor) continue;
    entries.push({
      id: `signer:${signer.key}`,
      kind: "signer",
      reference: signer.key,
      sponsor: signer.sponsor
    });
  }

  for (const offer of offers) {
    if (!offer.sponsor) continue;
    const reference = String(offer.id);
    entries.push({
      id: `offer:${reference}`,
      kind: "offer",
      reference,
      sponsor: offer.sponsor
    });
  }

  for (const [name, sponsor] of dataSponsors) {
    entries.push({
      id: `data:${name}`,
      kind: "data",
      reference: name,
      sponsor
    });
  }

  const rank: Record<SponsoredEntryKind, number> = {
    account: 0,
    trustline: 1,
    signer: 2,
    offer: 3,
    data: 4
  };

  return entries.sort(
    (left, right) =>
      rank[left.kind] - rank[right.kind] || left.reference.localeCompare(right.reference)
  );
}

export function calculateNetReserveEffectStroops(
  numSponsored: number,
  numSponsoring: number,
  baseReserveStroops: string
): string {
  return (
    (BigInt(String(numSponsored)) - BigInt(String(numSponsoring))) *
    BigInt(baseReserveStroops)
  ).toString();
}

/** Loads and normalises current sponsorship state without throwing expected failures. */
export async function runSponsoredReserves(
  { accountId }: SponsoredReservesInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<SponsoredReservesResult, SponsoredReservesErrorCode>> {
  try {
    const account = await requestJson<RawAccount>(
      horizonUrl(network, `/accounts/${encodeURIComponent(accountId)}`),
      signal
    );

    // `num_sponsored` counts every reserve unit another account pays for here.
    // At zero, no offer and no data entry can be sponsored, so the follow-up
    // requests that only exist to find sponsors are provably pointless.
    const hasSponsoredEntries = account.num_sponsored > 0;
    const dataNames = Object.keys(account.data);

    const [offers, dataSponsors, ledgers] = await Promise.all([
      hasSponsoredEntries
        ? collectRecords<RawOffer>(
            network,
            `/accounts/${encodeURIComponent(accountId)}/offers`,
            signal
          )
        : Promise.resolve([]),
      hasSponsoredEntries && dataNames.length
        ? loadDataSponsors(network, accountId, dataNames, signal)
        : Promise.resolve(new Map<string, string>()),
      requestJson<Collection<RawLedger>>(
        horizonUrl(network, "/ledgers", { limit: 1, order: "desc" }),
        signal
      )
    ]);

    const baseReserveStroops = String(ledgers._embedded.records[0]?.base_reserve_in_stroops ?? "");
    if (!/^\d+$/.test(baseReserveStroops)) {
      throw new Error("Horizon did not return a base reserve.");
    }

    return ok({
      accountId: account.account_id,
      sponsoredEntries: normalizeSponsoredEntries(account, offers, dataSponsors),
      numSponsoring: account.num_sponsoring,
      numSponsored: account.num_sponsored,
      baseReserveStroops,
      netReserveEffectStroops: calculateNetReserveEffectStroops(
        account.num_sponsored,
        account.num_sponsoring,
        baseReserveStroops
      )
    });
  } catch (error) {
    return err(toSponsoredReservesErrorCode(error));
  }
}
