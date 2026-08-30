import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toAssetStatisticsErrorCode } from "@/features/asset-statistics/lib/assetStatistics.errors";
import {
  normalizeAmount,
  sumAmounts
} from "@/features/asset-statistics/lib/format";
import type {
  AssetStatisticsErrorCode,
  AssetStatisticsInput,
  AssetStatisticsResult
} from "@/features/asset-statistics/types";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readCount(source: JsonObject, key: string, fallback?: number): number | null {
  const value = source[key];
  if (value === undefined && fallback !== undefined) return fallback;
  return Number.isSafeInteger(value) && Number(value) >= 0 ? Number(value) : null;
}

function readAmount(source: JsonObject, key: string, fallback?: string): string | null {
  const value = source[key] ?? fallback;
  return typeof value === "string" ? normalizeAmount(value) : null;
}

/** Validates and converts one Horizon asset record without using floating point. */
export function parseAssetRecord(
  record: unknown,
  input: AssetStatisticsInput
): Result<AssetStatisticsResult, "request_failed"> {
  if (!isObject(record) || !isObject(record.accounts) || !isObject(record.balances)) {
    return err("request_failed");
  }

  const authorizedHolders = readCount(record.accounts, "authorized");
  const liabilitiesOnlyHolders = readCount(
    record.accounts,
    "authorized_to_maintain_liabilities"
  );
  const unauthorizedHolders = readCount(record.accounts, "unauthorized");
  const claimableCount = readCount(record, "num_claimable_balances");
  const liquidityPoolCount = readCount(record, "num_liquidity_pools", 0);
  const contractCount = readCount(record, "num_contracts", 0);

  const authorized = readAmount(record.balances, "authorized");
  const liabilitiesOnly = readAmount(
    record.balances,
    "authorized_to_maintain_liabilities"
  );
  const unauthorized = readAmount(record.balances, "unauthorized");
  const claimableAmount = readAmount(record, "claimable_balances_amount");
  const liquidityPoolAmount = readAmount(record, "liquidity_pools_amount", "0.0000000");
  const contractAmount = readAmount(record, "contracts_amount", "0.0000000");

  const counts = [
    authorizedHolders,
    liabilitiesOnlyHolders,
    unauthorizedHolders,
    claimableCount,
    liquidityPoolCount,
    contractCount
  ];
  const amounts = [
    authorized,
    liabilitiesOnly,
    unauthorized,
    claimableAmount,
    liquidityPoolAmount,
    contractAmount
  ];

  if (counts.some((value) => value === null) || amounts.some((value) => value === null)) {
    return err("request_failed");
  }

  if (
    record.asset_code !== input.assetCode ||
    record.asset_issuer !== input.issuerId ||
    !isObject(record.flags)
  ) {
    return err("request_failed");
  }

  const normalizedAmounts = amounts as string[];
  const accountTotal = sumAmounts(normalizedAmounts.slice(0, 3));
  const circulatingSupply = sumAmounts(normalizedAmounts);
  if (accountTotal === null || circulatingSupply === null) return err("request_failed");

  return ok({
    assetCode: input.assetCode,
    issuerId: input.issuerId,
    holders: {
      authorized: authorizedHolders as number,
      liabilitiesOnly: liabilitiesOnlyHolders as number,
      unauthorized: unauthorizedHolders as number,
      total:
        (authorizedHolders as number) +
        (liabilitiesOnlyHolders as number) +
        (unauthorizedHolders as number)
    },
    accountBalances: {
      authorized: authorized as string,
      liabilitiesOnly: liabilitiesOnly as string,
      unauthorized: unauthorized as string,
      total: accountTotal
    },
    claimableBalances: {
      count: claimableCount as number,
      amount: claimableAmount as string
    },
    liquidityPools: {
      count: liquidityPoolCount as number,
      amount: liquidityPoolAmount as string
    },
    contracts: { count: contractCount as number, amount: contractAmount as string },
    circulatingSupply,
    flags: {
      authRequired: record.flags.auth_required === true,
      authRevocable: record.flags.auth_revocable === true,
      authImmutable: record.flags.auth_immutable === true,
      authClawbackEnabled: record.flags.auth_clawback_enabled === true
    }
  });
}

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function loadAssetStatistics(
  input: AssetStatisticsInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<AssetStatisticsResult, AssetStatisticsErrorCode>> {
  try {
    const response = await fetch(
      horizonUrl(network, "/assets", {
        asset_code: input.assetCode,
        asset_issuer: input.issuerId
      }),
      { signal }
    );
    if (!response.ok) return err(toAssetStatisticsErrorCode({ status: response.status }));

    const payload: unknown = await response.json();
    if (!isObject(payload) || !isObject(payload._embedded)) return err("request_failed");

    const records = payload._embedded.records;
    if (!Array.isArray(records)) return err("request_failed");
    if (records.length === 0) return err("asset_not_found");

    const exact = records.find(
      (record) =>
        isObject(record) &&
        record.asset_code === input.assetCode &&
        record.asset_issuer === input.issuerId
    );
    if (!exact) return err("asset_not_found");

    return parseAssetRecord(exact, input);
  } catch (error) {
    return err(toAssetStatisticsErrorCode(error));
  }
}
