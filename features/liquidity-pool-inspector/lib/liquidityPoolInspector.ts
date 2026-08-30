import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import {
  AMOUNT_SCALE,
  impliedPrice,
  parseAmount,
  shareValue
} from "@/features/liquidity-pool-inspector/lib/format";
import { toLiquidityPoolInspectorErrorCode } from "@/features/liquidity-pool-inspector/lib/liquidityPoolInspector.errors";
import type {
  LiquidityPoolInspectorErrorCode,
  LiquidityPoolInspectorInput,
  LiquidityPoolInspectorResult,
  PoolReserve
} from "@/features/liquidity-pool-inspector/types";

interface HorizonReserve {
  asset: string;
  amount: string;
}

interface HorizonLiquidityPool {
  id: string;
  fee_bp: number;
  total_shares: string;
  total_trustlines?: string | number;
  num_pool_members?: string | number;
  reserves: HorizonReserve[];
}

function parseHorizonAsset(asset: string): Omit<PoolReserve, "amount"> {
  if (asset === "native") return { assetType: "native" };

  const [assetCode, assetIssuer] = asset.split(":");
  return {
    assetType: "credit",
    assetCode,
    assetIssuer
  };
}

function participantCount(pool: HorizonLiquidityPool): {
  count: number;
  source: LiquidityPoolInspectorResult["participantSource"];
} {
  if (pool.num_pool_members !== undefined && pool.num_pool_members !== null) {
    return {
      count: Number(pool.num_pool_members),
      source: "num_pool_members"
    };
  }

  return {
    count: Number(pool.total_trustlines ?? 0),
    source: "total_trustlines"
  };
}

/** Pure normaliser so reserve math and Horizon field mapping can be tested directly. */
export function normalizeLiquidityPool(pool: HorizonLiquidityPool): LiquidityPoolInspectorResult {
  if (pool.reserves.length !== 2) {
    throw new Error("Expected exactly two pool reserves");
  }

  const reserves = pool.reserves.map((entry) => ({
    ...parseHorizonAsset(entry.asset),
    amount: entry.amount
  })) as [PoolReserve, PoolReserve];

  const amountA = parseAmount(reserves[0].amount);
  const amountB = parseAmount(reserves[1].amount);
  const totalShares = parseAmount(pool.total_shares);
  const participants = participantCount(pool);

  return {
    poolId: pool.id,
    feeBp: pool.fee_bp,
    totalShares: pool.total_shares,
    participantCount: participants.count,
    participantSource: participants.source,
    reserves,
    priceAToB: impliedPrice(amountA, amountB),
    priceBToA: impliedPrice(amountB, amountA),
    shareValueA: shareValue(amountA, totalShares),
    shareValueB: shareValue(amountB, totalShares),
    pricePrecision: AMOUNT_SCALE
  };
}

export async function runLiquidityPoolInspector(
  input: LiquidityPoolInspectorInput,
  network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<LiquidityPoolInspectorResult, LiquidityPoolInspectorErrorCode>> {
  try {
    const pool = (await horizonServer(network)
      .liquidityPools()
      .liquidityPoolId(input.poolId)
      .call()) as unknown as HorizonLiquidityPool;

    return ok(normalizeLiquidityPool(pool));
  } catch (error) {
    return err(toLiquidityPoolInspectorErrorCode(error));
  }
}
