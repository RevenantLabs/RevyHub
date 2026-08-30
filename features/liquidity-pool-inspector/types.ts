export interface LiquidityPoolInspectorInput {
  poolId: string;
}

export interface PoolReserve {
  assetType: "native" | "credit";
  assetCode?: string;
  assetIssuer?: string;
  amount: string;
}

export interface LiquidityPoolInspectorResult {
  poolId: string;
  feeBp: number;
  totalShares: string;
  participantCount: number;
  /** Which Horizon field supplied the participant count. */
  participantSource: "num_pool_members" | "total_trustlines";
  reserves: [PoolReserve, PoolReserve];
  /** How many units of reserve B one unit of reserve A buys at current ratios. */
  priceAToB: string;
  /** How many units of reserve A one unit of reserve B buys at current ratios. */
  priceBToA: string;
  /** Reserve A backing one pool share. */
  shareValueA: string;
  /** Reserve B backing one pool share. */
  shareValueB: string;
  /** Fractional digits kept when deriving prices and share values. */
  pricePrecision: number;
}

export type LiquidityPoolInspectorErrorCode =
  | "empty_input"
  | "invalid_pool_id"
  | "pool_not_found"
  | "rate_limited"
  | "request_failed";
