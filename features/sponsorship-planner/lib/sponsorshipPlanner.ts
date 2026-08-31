import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { amountToStroops } from "@/features/sponsorship-planner/lib/format";
import { toSponsorshipPlannerErrorCode } from "@/features/sponsorship-planner/lib/sponsorshipPlanner.errors";
import type {
  PlannedEntry,
  PlannedEntryKind,
  SandwichStep,
  SponsorshipOperation,
  SponsorshipPlannerErrorCode,
  SponsorshipPlannerInput,
  SponsorshipPlannerResult
} from "@/features/sponsorship-planner/types";

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
  balance?: string;
  asset_code?: string;
  asset_issuer?: string;
  liquidity_pool_id?: string;
  sponsor?: string;
}

export interface RawSigner {
  key: string;
  sponsor?: string;
}

export interface RawOffer {
  id: string | number;
  paging_token: string;
  sponsor?: string;
}

export interface RawClaimableBalance {
  id: string;
  sponsor?: string;
  paging_token?: string;
}

export interface RawEffect {
  type: string;
  paging_token: string;
  data_name?: string;
  sponsor?: string;
  new_sponsor?: string;
}

export interface RawAccount {
  account_id: string;
  /** Present when another account pays this account's own entry reserve. */
  sponsor?: string;
  balances: RawBalance[];
  signers: RawSigner[];
  data: Record<string, string>;
  subentry_count: number;
  num_sponsoring: number;
  num_sponsored: number;
}

interface RawLedger {
  base_reserve_in_stroops: string | number;
}

interface Collection<T> {
  _embedded: { records: T[] };
}

class HorizonResponseError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Horizon returned HTTP ${status}`);
    this.name = "HorizonResponseError";
    this.status = status;
  }
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" }
  });

  if (!response.ok) throw new HorizonResponseError(response.status);
  return (await response.json()) as T;
}

/**
 * Loads an account, returning `null` for a 404.
 *
 * The sponsored account not existing is the normal sponsorship case, so the
 * caller decides what a 404 means: `sponsor_not_found` for the sponsor, an
 * empty plan input for the sponsored account.
 */
async function loadAccount(
  accountId: string,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<RawAccount | null> {
  try {
    return await requestJson<RawAccount>(
      horizonUrl(network, `/accounts/${encodeURIComponent(accountId)}`),
      signal
    );
  } catch (error) {
    if (error instanceof HorizonResponseError && error.status === 404) return null;
    throw error;
  }
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

async function collectOffers(
  network: StellarNetwork,
  accountId: string,
  signal?: AbortSignal
): Promise<RawOffer[]> {
  return collectRecords<RawOffer>(
    network,
    `/accounts/${encodeURIComponent(accountId)}/offers`,
    signal
  );
}

async function collectClaimableBalances(
  network: StellarNetwork,
  accountId: string,
  signal?: AbortSignal
): Promise<RawClaimableBalance[]> {
  // Horizon exposes claimable balances by claimant and by sponsor, not by
  // creator, so the claimant filter — the same source the claimable-balances
  // tool uses — is the closest enumeration the API offers.
  return collectClaimableByClaimant(network, accountId, signal);
}

async function collectClaimableByClaimant(
  network: StellarNetwork,
  accountId: string,
  signal?: AbortSignal
): Promise<RawClaimableBalance[]> {
  const records: RawClaimableBalance[] = [];
  let cursor: string | undefined;

  while (true) {
    const page = await requestJson<Collection<RawClaimableBalance>>(
      horizonUrl(network, "/claimable_balances", {
        claimant: accountId,
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

function nativeBalanceStroops(account: RawAccount): bigint {
  const native = account.balances.find((balance) => balance.asset_type === "native");
  if (!native?.balance) throw new Error("Horizon account has no native balance.");
  return amountToStroops(native.balance);
}

function minimumBalanceStroops(account: RawAccount, baseReserveStroops: string): bigint {
  const units =
    2 + account.subentry_count + account.num_sponsoring - account.num_sponsored;
  return BigInt(units) * BigInt(baseReserveStroops);
}

const KIND_RANK: Record<PlannedEntryKind, number> = {
  account: 0,
  trustline: 1,
  signer: 2,
  data: 3,
  offer: 4,
  claimable_balance: 5
};

function sortEntries(entries: PlannedEntry[]): PlannedEntry[] {
  return entries.sort(
    (left, right) =>
      KIND_RANK[left.kind] - KIND_RANK[right.kind] ||
      left.reference.localeCompare(right.reference)
  );
}

const SUBENTRY_OPERATION: Record<
  Exclude<PlannedEntryKind, "account">,
  SponsorshipOperation
> = {
  trustline: "change_trust",
  signer: "set_options",
  data: "manage_data",
  offer: "manage_sell_offer",
  claimable_balance: "create_claimable_balance"
};

/** The begin/end sponsorship sandwich the plan implies, in operation order. */
export function buildSandwich(
  plannedEntries: readonly PlannedEntry[],
  sponsoredAccountId: string
): SandwichStep[] {
  const steps: SandwichStep[] = [
    { operation: "begin_sponsoring_future_reserves", source: "sponsor" }
  ];

  for (const entry of plannedEntries) {
    if (entry.kind === "account") {
      steps.push({
        operation: "create_account",
        source: "sponsor",
        reference: sponsoredAccountId
      });
    } else {
      steps.push({
        operation: SUBENTRY_OPERATION[entry.kind],
        source: "sponsor",
        reference: entry.reference
      });
    }
  }

  steps.push({ operation: "end_sponsoring_future_reserves", source: "sponsored" });
  return steps;
}

export interface PlanInputs {
  baseReserveStroops: string;
  sponsor: RawAccount;
  sponsoredAccountId: string;
  sponsoredAccountExists: boolean;
  sponsored?: RawAccount;
  offers: RawOffer[];
  claimableBalances: RawClaimableBalance[];
  dataSponsors: ReadonlyMap<string, string>;
}

/**
 * Builds the plan from the loaded state. Pure reserve arithmetic in stroops —
 * the only way to stay exact past the float safe range.
 */
export function buildSponsorshipPlan(inputs: PlanInputs): SponsorshipPlannerResult {
  const base = BigInt(inputs.baseReserveStroops);
  const planned: PlannedEntry[] = [];
  const alreadySponsored: PlannedEntry[] = [];

  if (inputs.sponsoredAccountExists) {
    const sponsored = inputs.sponsored as RawAccount;

    if (sponsored.sponsor) {
      alreadySponsored.push({
        id: `account:${sponsored.account_id}`,
        kind: "account",
        reference: sponsored.account_id,
        reserveUnits: 2,
        existingSponsor: sponsored.sponsor
      });
    }

    for (const balance of sponsored.balances) {
      if (balance.asset_type === "native") continue;
      const reference = trustlineReference(balance);
      const id = `trustline:${reference}`;
      if (balance.sponsor) {
        alreadySponsored.push({
          id,
          kind: "trustline",
          reference,
          reserveUnits: 1,
          existingSponsor: balance.sponsor
        });
      } else {
        planned.push({ id, kind: "trustline", reference, reserveUnits: 1 });
      }
    }

    // The master key is not a subentry, so it is skipped like the native balance.
    for (const signer of sponsored.signers) {
      if (signer.key === sponsored.account_id) continue;
      const id = `signer:${signer.key}`;
      if (signer.sponsor) {
        alreadySponsored.push({
          id,
          kind: "signer",
          reference: signer.key,
          reserveUnits: 1,
          existingSponsor: signer.sponsor
        });
      } else {
        planned.push({ id, kind: "signer", reference: signer.key, reserveUnits: 1 });
      }
    }

    for (const name of Object.keys(sponsored.data)) {
      const sponsor = inputs.dataSponsors.get(name);
      const id = `data:${name}`;
      if (sponsor) {
        alreadySponsored.push({
          id,
          kind: "data",
          reference: name,
          reserveUnits: 1,
          existingSponsor: sponsor
        });
      } else {
        planned.push({ id, kind: "data", reference: name, reserveUnits: 1 });
      }
    }

    for (const offer of inputs.offers) {
      const reference = String(offer.id);
      const id = `offer:${reference}`;
      if (offer.sponsor) {
        alreadySponsored.push({
          id,
          kind: "offer",
          reference,
          reserveUnits: 1,
          existingSponsor: offer.sponsor
        });
      } else {
        planned.push({ id, kind: "offer", reference, reserveUnits: 1 });
      }
    }

    for (const balance of inputs.claimableBalances) {
      const reference = balance.id;
      const id = `claimable_balance:${reference}`;
      if (balance.sponsor) {
        alreadySponsored.push({
          id,
          kind: "claimable_balance",
          reference,
          reserveUnits: 1,
          existingSponsor: balance.sponsor
        });
      } else {
        planned.push({ id, kind: "claimable_balance", reference, reserveUnits: 1 });
      }
    }
  } else {
    // A brand-new account has no subentries yet. The plan covers its account
    // entry (two reserve units) with a sponsored create_account.
    planned.push({
      id: `account:${inputs.sponsoredAccountId}`,
      kind: "account",
      reference: inputs.sponsoredAccountId,
      reserveUnits: 2
    });
  }

  sortEntries(planned);
  sortEntries(alreadySponsored);

  const plannedUnits = planned.reduce((sum, entry) => sum + entry.reserveUnits, 0);
  const plannedCost = base * BigInt(plannedUnits);

  const sponsorBalance = nativeBalanceStroops(inputs.sponsor);
  const sponsorCurrentMinimum = minimumBalanceStroops(inputs.sponsor, inputs.baseReserveStroops);
  const sponsorResultingMinimum = sponsorCurrentMinimum + plannedCost;
  const sponsorShortfall =
    sponsorResultingMinimum > sponsorBalance ? sponsorResultingMinimum - sponsorBalance : 0n;

  const sponsoredCurrentMinimum = inputs.sponsoredAccountExists
    ? minimumBalanceStroops(inputs.sponsored as RawAccount, inputs.baseReserveStroops)
    : 0n;
  const sponsoredResultingMinimum =
    sponsoredCurrentMinimum > plannedCost ? sponsoredCurrentMinimum - plannedCost : 0n;

  return {
    sponsorAccountId: inputs.sponsor.account_id,
    sponsoredAccountId: inputs.sponsoredAccountId,
    baseReserveStroops: inputs.baseReserveStroops,
    sponsoredAccountExists: inputs.sponsoredAccountExists,
    plannedEntries: planned,
    alreadySponsoredEntries: alreadySponsored,
    plannedUnits,
    plannedCostStroops: plannedCost.toString(),
    sponsorBalanceStroops: sponsorBalance.toString(),
    sponsorCurrentMinimumStroops: sponsorCurrentMinimum.toString(),
    sponsorResultingMinimumStroops: sponsorResultingMinimum.toString(),
    sponsorShortfallStroops: sponsorShortfall.toString(),
    sponsoredCurrentMinimumStroops: sponsoredCurrentMinimum.toString(),
    sponsoredResultingMinimumStroops: sponsoredResultingMinimum.toString(),
    sponsoredStillNeedsStroops: sponsoredResultingMinimum.toString(),
    sandwich: buildSandwich(planned, inputs.sponsoredAccountId)
  };
}

/** Loads both accounts, the base reserve and the sponsored account's entries. */
export async function runSponsorshipPlanner(
  input: SponsorshipPlannerInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<SponsorshipPlannerResult, SponsorshipPlannerErrorCode>> {
  try {
    const sponsor = await loadAccount(input.sponsorAccountId, network, signal);
    if (!sponsor) return err("sponsor_not_found");

    const sponsored = await loadAccount(input.sponsoredAccountId, network, signal);
    const sponsoredAccountExists = sponsored !== null;

    const ledgers = await requestJson<Collection<RawLedger>>(
      horizonUrl(network, "/ledgers", { limit: 1, order: "desc" }),
      signal
    );
    const baseReserveStroops = String(
      ledgers._embedded.records[0]?.base_reserve_in_stroops ?? ""
    );
    if (!/^\d+$/.test(baseReserveStroops)) return err("ledger_unavailable");

    let offers: RawOffer[] = [];
    let claimableBalances: RawClaimableBalance[] = [];
    let dataSponsors = new Map<string, string>();

    if (sponsoredAccountExists && sponsored) {
      const dataNames = Object.keys(sponsored.data);
      // When nothing on the account is sponsored, no data entry can be
      // sponsored either, so the effects walk that exists only to find data
      // sponsors is provably pointless.
      const hasSponsoredEntries = sponsored.num_sponsored > 0;

      [offers, claimableBalances, dataSponsors] = await Promise.all([
        collectOffers(network, input.sponsoredAccountId, signal),
        collectClaimableBalances(network, input.sponsoredAccountId, signal),
        hasSponsoredEntries && dataNames.length
          ? loadDataSponsors(network, input.sponsoredAccountId, dataNames, signal)
          : Promise.resolve(new Map<string, string>())
      ]);
    }

    return ok(
      buildSponsorshipPlan({
        baseReserveStroops,
        sponsor,
        sponsoredAccountId: input.sponsoredAccountId,
        sponsoredAccountExists,
        sponsored: sponsored ?? undefined,
        offers,
        claimableBalances,
        dataSponsors
      })
    );
  } catch (error) {
    return err(toSponsorshipPlannerErrorCode(error));
  }
}
