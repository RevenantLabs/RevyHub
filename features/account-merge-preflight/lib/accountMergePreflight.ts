import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toAccountMergePreflightErrorCode } from "@/features/account-merge-preflight/lib/accountMergePreflight.errors";
import {
  amountToStroops,
  formatAsset,
  stroopsToAmount
} from "@/features/account-merge-preflight/lib/format";
import type {
  AccountMergeBlocker,
  AccountMergeCheck,
  AccountMergeCheckId,
  AccountMergePreflightErrorCode,
  AccountMergePreflightInput,
  AccountMergePreflightResult,
  HorizonMergeAccount,
  HorizonOffer
} from "@/features/account-merge-preflight/types";

const INT64_MAX = 9_223_372_036_854_775_807n;
const OFFER_PAGE_SIZE = 200;
const MAX_OFFER_PAGES = 6;
const REQUEST_TIMEOUT_MS = 12_000;

export class HorizonResponseError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Horizon returned HTTP ${status}`);
    this.name = "HorizonResponseError";
    this.status = status;
  }
}

async function fetchJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new HorizonResponseError(response.status);
  return response.json();
}

function unsignedInteger(value: unknown): bigint | null {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    !/^\d+$/.test(String(value))
  ) {
    return null;
  }

  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function countCheck(id: AccountMergeCheckId, blockerCount: number): AccountMergeCheck {
  return { id, passed: blockerCount === 0, blockerCount };
}

function isAccountPayload(value: unknown): value is HorizonMergeAccount {
  if (typeof value !== "object" || value === null) return false;
  const account = value as Partial<HorizonMergeAccount>;
  return (
    typeof account.account_id === "string" &&
    Array.isArray(account.balances) &&
    typeof account.data === "object" &&
    account.data !== null &&
    !Array.isArray(account.data) &&
    typeof account.flags?.auth_immutable === "boolean" &&
    typeof account.thresholds?.high_threshold === "number" &&
    Number.isInteger(account.thresholds.high_threshold) &&
    Array.isArray(account.signers)
  );
}

async function loadAccount(
  accountId: string,
  network: StellarNetwork,
  notFoundCode: "source_not_found" | "destination_not_found",
  signal: AbortSignal
): Promise<Result<HorizonMergeAccount, AccountMergePreflightErrorCode>> {
  try {
    const payload = await fetchJson(
      horizonUrl(network, `/accounts/${encodeURIComponent(accountId)}`),
      signal
    );
    if (!isAccountPayload(payload) || payload.account_id !== accountId) {
      return err("request_failed");
    }
    return ok(payload);
  } catch (error) {
    return err(toAccountMergePreflightErrorCode(error, notFoundCode));
  }
}

async function loadAllOffers(
  accountId: string,
  network: StellarNetwork,
  signal: AbortSignal
): Promise<Result<HorizonOffer[], AccountMergePreflightErrorCode>> {
  const offers: HorizonOffer[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  try {
    for (let pageIndex = 0; pageIndex < MAX_OFFER_PAGES; pageIndex += 1) {
      const payload = (await fetchJson(
        horizonUrl(network, `/accounts/${encodeURIComponent(accountId)}/offers`, {
          limit: OFFER_PAGE_SIZE,
          cursor
        }),
        signal
      )) as { _embedded?: { records?: HorizonOffer[] } };
      const records = payload._embedded?.records;
      if (!Array.isArray(records)) return err("request_failed");
      offers.push(...records);

      if (records.length < OFFER_PAGE_SIZE) return ok(offers);
      const nextCursor = records.at(-1)?.paging_token;
      if (!nextCursor || seenCursors.has(nextCursor)) return err("request_failed");
      seenCursors.add(nextCursor);
      cursor = nextCursor;
    }
    return err("request_failed");
  } catch {
    return err("request_failed");
  }
}

function analyzeMergePreflightUnchecked(
  source: HorizonMergeAccount,
  destination: HorizonMergeAccount,
  offers: HorizonOffer[]
): Result<AccountMergePreflightResult, AccountMergePreflightErrorCode> {
  const sourceNative = source.balances.find((balance) => balance.asset_type === "native");
  const destinationNative = destination.balances.find(
    (balance) => balance.asset_type === "native"
  );
  const sourceStroops = sourceNative ? amountToStroops(sourceNative.balance) : null;
  const destinationStroops = destinationNative
    ? amountToStroops(destinationNative.balance)
    : null;
  const destinationBuyingLiabilities = destinationNative
    ? amountToStroops(destinationNative.buying_liabilities ?? "0")
    : null;
  const requiredSignerWeight = unsignedInteger(source.thresholds.high_threshold);
  const sponsorshipCount = unsignedInteger(source.num_sponsoring);
  const sponsoredSubentryCount = unsignedInteger(source.num_sponsored);
  const signerWeights = source.signers.map((signer) => unsignedInteger(signer.weight));

  if (
    sourceStroops === null ||
    destinationStroops === null ||
    destinationBuyingLiabilities === null ||
    requiredSignerWeight === null ||
    sponsorshipCount === null ||
    sponsoredSubentryCount === null ||
    signerWeights.some((weight) => weight === null)
  ) {
    return err("request_failed");
  }

  if (
    sourceStroops > INT64_MAX ||
    destinationStroops > INT64_MAX ||
    destinationBuyingLiabilities > INT64_MAX
  ) {
    return err("request_failed");
  }

  const configuredSignerWeight = signerWeights.reduce<bigint>(
    (total, weight) => total + (weight ?? 0n),
    0n
  );
  const maximumReceivable = INT64_MAX - destinationStroops - destinationBuyingLiabilities;
  if (maximumReceivable < 0n) return err("request_failed");

  const blockers: AccountMergeBlocker[] = [];
  const trustlines = source.balances.filter((balance) => balance.asset_type !== "native");
  for (const trustline of trustlines) {
    blockers.push({
      kind: "trustline",
      subentryType:
        trustline.asset_type === "liquidity_pool_shares" ? "liquidity_pool" : "trustline",
      asset:
        trustline.asset_type === "liquidity_pool_shares"
          ? (trustline.liquidity_pool_id ?? trustline.asset_type)
          : formatAsset(trustline),
      balance: trustline.balance
    });
  }

  for (const offer of offers) {
    blockers.push({
      kind: "offer",
      id: String(offer.id),
      selling: formatAsset(offer.selling),
      buying: formatAsset(offer.buying)
    });
  }

  const dataNames = Object.keys(source.data).sort();
  for (const name of dataNames) blockers.push({ kind: "data_entry", name });

  if (sponsorshipCount > 0n) {
    blockers.push({ kind: "sponsorship", count: sponsorshipCount });
  }
  if (configuredSignerWeight < requiredSignerWeight) {
    blockers.push({
      kind: "signer_weight",
      required: requiredSignerWeight,
      configured: configuredSignerWeight
    });
  }
  if (source.flags.auth_immutable) blockers.push({ kind: "immutable_auth" });

  const transferableXlm = stroopsToAmount(sourceStroops);
  const destinationMaximumReceivableXlm = stroopsToAmount(maximumReceivable);
  if (sourceStroops > maximumReceivable) {
    blockers.push({
      kind: "destination_capacity",
      transferableXlm,
      maximumReceivableXlm: destinationMaximumReceivableXlm
    });
  }

  const count = (kind: AccountMergeBlocker["kind"]) =>
    blockers.filter((blocker) => blocker.kind === kind).length;
  const checks: AccountMergeCheck[] = [
    { id: "destination_exists", passed: true, blockerCount: 0 },
    countCheck("trustlines", count("trustline")),
    countCheck("offers", count("offer")),
    countCheck("data_entries", count("data_entry")),
    countCheck("sponsorships", count("sponsorship")),
    countCheck("signer_weight", count("signer_weight")),
    countCheck("immutable_auth", count("immutable_auth")),
    countCheck("destination_capacity", count("destination_capacity"))
  ];

  return ok({
    sourceAccountId: source.account_id,
    destinationAccountId: destination.account_id,
    mergeable: blockers.length === 0,
    transferableXlm,
    destinationMaximumReceivableXlm,
    requiredSignerWeight,
    configuredSignerWeight,
    sponsoredSubentryCount,
    checks,
    blockers
  });
}

export function analyzeMergePreflight(
  source: HorizonMergeAccount,
  destination: HorizonMergeAccount,
  offers: HorizonOffer[]
): Result<AccountMergePreflightResult, AccountMergePreflightErrorCode> {
  try {
    return analyzeMergePreflightUnchecked(source, destination, offers);
  } catch {
    return err("request_failed");
  }
}

export async function checkAccountMergePreflight(
  input: AccountMergePreflightInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<AccountMergePreflightResult, AccountMergePreflightErrorCode>> {
  if (input.sourceAccountId === input.destinationAccountId) return err("same_account");

  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const source = await loadAccount(
      input.sourceAccountId,
      network,
      "source_not_found",
      controller.signal
    );
    if (!source.ok) return source;

    const destination = await loadAccount(
      input.destinationAccountId,
      network,
      "destination_not_found",
      controller.signal
    );
    if (!destination.ok) return destination;

    const offers = await loadAllOffers(input.sourceAccountId, network, controller.signal);
    if (!offers.ok) return offers;

    return analyzeMergePreflight(source.value, destination.value, offers.value);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
