import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { copy } from "@/features/liquidity-pool-calculator/copy";
import { toLiquidityPoolCalculatorErrorCode } from "@/features/liquidity-pool-calculator/lib/liquidityPoolCalculator.errors";
import { formatFraction } from "@/features/liquidity-pool-calculator/lib/format";
import { AMOUNT, POOL_ID, positiveAmount } from "@/features/liquidity-pool-calculator/schema";
import type {
  LiquidityPoolCalculatorAction,
  LiquidityPoolCalculatorErrorCode,
  LiquidityPoolCalculatorInput,
  LiquidityPoolCalculatorResult,
  PriceFraction
} from "@/features/liquidity-pool-calculator/types";

const SCALE = 10_000_000n;
const BPS = 10_000n;
const MATERIAL_IMPACT_BPS = 100;

interface HorizonPool {
  id?: string;
  fee_bp?: number;
  total_shares?: string;
  reserves?: Array<{ asset?: string; amount?: string }>;
}

interface CalculationRequest {
  poolId: string;
  action: LiquidityPoolCalculatorAction;
  amountA?: string;
  amountB?: string;
  shares?: string;
  slippageBps: number;
}

function parseAmount(value: unknown): bigint | null {
  if (typeof value !== "string" || !AMOUNT.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(7, "0"));
}

function formatAmount(value: bigint): string {
  const whole = value / SCALE;
  const fraction = (value % SCALE).toString().padStart(7, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

function gcd(left: bigint, right: bigint): bigint {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;
  while (b !== 0n) [a, b] = [b, a % b];
  return a || 1n;
}

export function fraction(numerator: bigint, denominator: bigint): PriceFraction {
  if (denominator === 0n) return { numerator: "0", denominator: "0", display: "undefined" };
  const sign = denominator < 0n ? -1n : 1n;
  const n = numerator * sign;
  const d = denominator * sign;
  const divisor = gcd(n, d);
  const reducedN = n / divisor;
  const reducedD = d / divisor;
  return { numerator: reducedN.toString(), denominator: reducedD.toString(), display: formatFraction(reducedN, reducedD) };
}

function scaleFraction(value: PriceFraction, factorNumerator: bigint, factorDenominator: bigint): PriceFraction {
  return fraction(BigInt(value.numerator) * factorNumerator, BigInt(value.denominator) * factorDenominator);
}

export function squareRootFloor(value: bigint): bigint {
  if (value < 0n) throw new Error("negative square root");
  if (value < 2n) return value;
  let low = 1n;
  let high = value;
  while (low <= high) {
    const mid = (low + high) / 2n;
    if (mid * mid <= value) low = mid + 1n;
    else high = mid - 1n;
  }
  return high;
}

function requestFromInput(input: LiquidityPoolCalculatorInput): Result<CalculationRequest, LiquidityPoolCalculatorErrorCode> {
  if (input.poolId || input.action) {
    if (!input.poolId) return err("empty_pool_id");
    if (!POOL_ID.test(input.poolId)) return err("invalid_pool_id");
    if (input.action !== "deposit" && input.action !== "withdraw") return err("invalid_amount");
    const slippageBps = input.slippageBps ?? 0;
    if (!Number.isInteger(slippageBps) || slippageBps < 0 || slippageBps > 10_000) return err("invalid_amount");
    if (input.action === "deposit" && (!positiveAmount(input.amountA) || !positiveAmount(input.amountB))) return err("invalid_amount");
    if (input.action === "withdraw" && !positiveAmount(input.shares)) return err("invalid_amount");
    return ok({ poolId: input.poolId.toLowerCase(), action: input.action, amountA: input.amountA, amountB: input.amountB, shares: input.shares, slippageBps });
  }
  if (!input.value?.trim()) return err("empty_pool_id");
  try {
    const parsed = JSON.parse(input.value) as Record<string, unknown>;
    const poolId = typeof parsed.poolId === "string" ? parsed.poolId.replace(/\s+/g, "").toLowerCase() : "";
    const action = parsed.action;
    const slippageBps = parsed.slippageBps === undefined ? 0 : parsed.slippageBps;
    if (!poolId) return err("empty_pool_id");
    if (!POOL_ID.test(poolId)) return err("invalid_pool_id");
    if (action !== "deposit" && action !== "withdraw") return err("invalid_amount");
    if (!Number.isInteger(slippageBps) || Number(slippageBps) < 0 || Number(slippageBps) > 10_000) return err("invalid_amount");
    if (action === "deposit") {
      if (!positiveAmount(parsed.amountA) || !positiveAmount(parsed.amountB)) return err("invalid_amount");
      return ok({ poolId, action, amountA: parsed.amountA, amountB: parsed.amountB, slippageBps: Number(slippageBps) });
    }
    if (!positiveAmount(parsed.shares)) return err("invalid_amount");
    return ok({ poolId, action, shares: parsed.shares, slippageBps: Number(slippageBps) });
  } catch {
    return err("invalid_pool_id");
  }
}

function requestError(status: number): Error & { status: number } {
  return Object.assign(new Error("Horizon request failed."), { status });
}

function parsePool(payload: unknown): { id: string; feeBp: number; totalShares: string; reserveA: string; reserveB: string } | null {
  if (typeof payload !== "object" || payload === null) return null;
  const pool = payload as HorizonPool;
  const reserves = pool.reserves;
  if (!Array.isArray(reserves) || reserves.length !== 2 || typeof pool.total_shares !== "string" || typeof pool.fee_bp !== "number" || !Number.isInteger(pool.fee_bp)) return null;
  const feeBp = pool.fee_bp;
  const reserveA = reserves[0]?.amount;
  const reserveB = reserves[1]?.amount;
  if (typeof reserveA !== "string" || typeof reserveB !== "string" || parseAmount(reserveA) === null || parseAmount(reserveB) === null) return null;
  return { id: typeof pool.id === "string" ? pool.id : "", feeBp, totalShares: pool.total_shares, reserveA, reserveB };
}

function priceImpactBps(amountA: bigint, amountB: bigint, reserveA: bigint, reserveB: bigint): number {
  if (reserveA === 0n || reserveB === 0n) return 0;
  const difference = amountB * reserveA - reserveB * amountA;
  const absolute = difference < 0n ? -difference : difference;
  const denominator = reserveB * amountA;
  if (denominator === 0n) return 0;
  const impact = absolute * BPS / denominator;
  return Number(impact > 1_000_000n ? 1_000_000n : impact);
}

/** Fetches a pool and calculates its operation entirely with fixed-point integers. */
export async function runLiquidityPoolCalculator(
  input: LiquidityPoolCalculatorInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<LiquidityPoolCalculatorResult, LiquidityPoolCalculatorErrorCode>> {
  const request = requestFromInput(input);
  if (!request.ok) return request;
  try {
    const response = await fetch(horizonUrl(network, `/liquidity_pools/${encodeURIComponent(request.value.poolId)}`), { signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw requestError(response.status);
    const pool = parsePool(await response.json());
    if (!pool) return err("request_failed");

    const reserveA = parseAmount(pool.reserveA)!;
    const reserveB = parseAmount(pool.reserveB)!;
    const totalShares = parseAmount(pool.totalShares);
    if (totalShares === null) return err("request_failed");
    const emptyPool = reserveA === 0n && reserveB === 0n && totalShares === 0n;
    if ((reserveA === 0n || reserveB === 0n) !== (totalShares === 0n)) return err("request_failed");

    const currentPrice = emptyPool ? null : fraction(reserveB, reserveA);
    const slippage = BigInt(request.value.slippageBps);
    const boundsBase = currentPrice ?? (request.value.action === "deposit" ? fraction(parseAmount(request.value.amountB)!, parseAmount(request.value.amountA)!) : fraction(0n, 1n));
    const priceLowerBound = scaleFraction(boundsBase, BPS - slippage, BPS);
    const priceUpperBound = scaleFraction(boundsBase, BPS + slippage, BPS);
    const baseResult = { poolId: request.value.poolId, network, reserveA: pool.reserveA, reserveB: pool.reserveB, totalShares: pool.totalShares, feeBp: pool.feeBp, priceLowerBound, priceUpperBound, currentPrice, poolRatio: currentPrice?.display ?? boundsBase.display, firstDeposit: emptyPool, materiallyMovesPool: false };

    if (request.value.action === "deposit") {
      const amountA = parseAmount(request.value.amountA);
      const amountB = parseAmount(request.value.amountB);
      if (amountA === null || amountB === null || amountA <= 0n || amountB <= 0n) return err("invalid_amount");
      const amountARaw = request.value.amountA!;
      const amountBRaw = request.value.amountB!;
      if (emptyPool) {
        const minted = squareRootFloor(amountA * amountB);
        if (minted <= 0n) return err("invalid_amount");
        return ok({ ...baseResult, action: "deposit", amountA: amountARaw, amountB: amountBRaw, consumedA: amountARaw, consumedB: amountBRaw, mintedShares: formatAmount(minted), minimumA: formatAmount(amountA * (BPS - slippage) / BPS), minimumB: formatAmount(amountB * (BPS - slippage) / BPS), priceImpactBps: 0, materiallyMovesPool: false, detail: copy.firstDepositDetail(amountARaw, amountBRaw) });
      }
      const mintedByA = amountA * totalShares / reserveA;
      const mintedByB = amountB * totalShares / reserveB;
      const minted = mintedByA < mintedByB ? mintedByA : mintedByB;
      if (minted <= 0n) return err("invalid_amount");
      const consumedA = minted * reserveA / totalShares;
      const consumedB = minted * reserveB / totalShares;
      const impact = priceImpactBps(amountA, amountB, reserveA, reserveB);
      const material = impact >= MATERIAL_IMPACT_BPS;
      return ok({ ...baseResult, action: "deposit", amountA: amountARaw, amountB: amountBRaw, consumedA: formatAmount(consumedA), consumedB: formatAmount(consumedB), mintedShares: formatAmount(minted), minimumA: formatAmount(consumedA * (BPS - slippage) / BPS), minimumB: formatAmount(consumedB * (BPS - slippage) / BPS), priceImpactBps: impact, materiallyMovesPool: material, detail: material ? copy.materialMoveDetail(impact) : copy.depositDetail(formatAmount(minted), formatAmount(consumedA), formatAmount(consumedB)) });
    }

    const shares = parseAmount(request.value.shares);
    if (shares === null || shares <= 0n) return err("invalid_amount");
    if (shares > totalShares) return err("insufficient_shares");
    const withdrawnA = reserveA * shares / totalShares;
    const withdrawnB = reserveB * shares / totalShares;
    return ok({ ...baseResult, action: "withdraw", shares: request.value.shares, withdrawnA: formatAmount(withdrawnA), withdrawnB: formatAmount(withdrawnB), minimumA: formatAmount(withdrawnA * (BPS - slippage) / BPS), minimumB: formatAmount(withdrawnB * (BPS - slippage) / BPS), priceImpactBps: 0, detail: copy.withdrawDetail(formatAmount(withdrawnA), formatAmount(withdrawnB)) });
  } catch (error) {
    return err(toLiquidityPoolCalculatorErrorCode(error));
  }
}

export { formatAmount, parseAmount };
