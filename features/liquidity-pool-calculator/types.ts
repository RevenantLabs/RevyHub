import type { StellarNetwork } from "@/core/network/types";

export type LiquidityPoolCalculatorAction = "deposit" | "withdraw";

/** Raw JSON is kept for the single-field form; parsed fields make the domain
 * function convenient to call in isolation as well. */
export interface LiquidityPoolCalculatorInput {
  value?: string;
  poolId?: string;
  action?: LiquidityPoolCalculatorAction;
  amountA?: string;
  amountB?: string;
  shares?: string;
  slippageBps?: number;
}

export interface PriceFraction {
  numerator: string;
  denominator: string;
  display: string;
}

export interface LiquidityPoolCalculatorResult {
  poolId: string;
  network: StellarNetwork;
  action: LiquidityPoolCalculatorAction;
  reserveA: string;
  reserveB: string;
  totalShares: string;
  feeBp: number;
  amountA?: string;
  amountB?: string;
  shares?: string;
  consumedA?: string;
  consumedB?: string;
  mintedShares?: string;
  withdrawnA?: string;
  withdrawnB?: string;
  minimumA?: string;
  minimumB?: string;
  /** Current reserve-B per reserve-A price, kept as an exact fraction. */
  currentPrice: PriceFraction | null;
  priceLowerBound: PriceFraction;
  priceUpperBound: PriceFraction;
  /** Backwards-compatible display alias for currentPrice. */
  poolRatio: string;
  priceImpactBps: number;
  materiallyMovesPool: boolean;
  firstDeposit: boolean;
  detail: string;
}

export type LiquidityPoolCalculatorErrorCode =
  | "empty_pool_id"
  | "invalid_pool_id"
  | "pool_not_found"
  | "invalid_amount"
  | "insufficient_shares"
  | "rate_limited"
  | "request_failed";
