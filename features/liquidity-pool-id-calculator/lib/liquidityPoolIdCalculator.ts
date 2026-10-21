import { ok, type Result } from "@/core/result/result";
import { canonicalOrder } from "./asset-canonical-order";
import { computePoolIdHash } from "./pool-id-hash";
import type { ErrorCode, LiquidityPoolIdResult, ParsedInput } from "../types";

/** Core tool logic. Computation is synchronous and local — never throws, never makes a request. */
export function calculateLiquidityPoolId(input: ParsedInput): Result<LiquidityPoolIdResult, ErrorCode> {
  const ordering = canonicalOrder(input.assetX, input.assetY);
  if (!ordering.ok) return ordering;

  const poolIdHex = computePoolIdHash(ordering.value, input.feeBps);

  return ok({ poolIdHex, ordering: ordering.value, feeBps: input.feeBps });
}
