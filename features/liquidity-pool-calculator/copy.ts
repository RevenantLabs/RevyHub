import type { LiquidityPoolCalculatorErrorCode } from "@/features/liquidity-pool-calculator/types";

export const copy = {
  formLabel: "Pool calculation",
  formHint: 'JSON: {"poolId":"64 hex chars","action":"deposit","amountA":"100","amountB":"25","slippageBps":50}',
  submit: "Calculate",
  working: "Calculating",
  emptyTitle: "No pool calculation yet",
  emptyDescription: "Provide a pool ID and choose a deposit or withdrawal preview.",
  resultTitle: "Pool calculation",
  depositTitle: "Deposit preview",
  withdrawTitle: "Withdraw preview",
  reserveRatio: "Current price (B per A)",
  priceLowerBound: "Minimum price bound",
  priceUpperBound: "Maximum price bound",
  mintedShares: "Shares minted",
  consumedA: "Asset A consumed",
  consumedB: "Asset B consumed",
  withdrawnA: "Asset A returned",
  withdrawnB: "Asset B returned",
  minimumA: "Minimum asset A",
  minimumB: "Minimum asset B",
  priceImpact: "Ratio impact",
  fee: "Pool fee (bp)",
  firstDeposit: "First deposit",
  materialWarning: "Material ratio movement",
  network: "Network",
  notAvailable: "n/a",
  firstDepositDetail: (amountA: string, amountB: string) => `First deposit sets the pool ratio at ${amountB}/${amountA}; both supplied reserves are consumed.`,
  depositDetail: (shares: string, consumedA: string, consumedB: string) => `Deposit mints ${shares} shares and consumes ${consumedA} A with ${consumedB} B.`,
  materialMoveDetail: (impact: number) => `Deposit ratio differs from current reserves by ${(impact / 100).toFixed(2)}%; review the price bounds before submitting.`,
  withdrawDetail: (amountA: string, amountB: string) => `Withdrawal returns ${amountA} A and ${amountB} B at the current pool ratio.`
} as const;

export const errorCopy: Record<LiquidityPoolCalculatorErrorCode, { title: string; description: string }> = {
  empty_pool_id: { title: "Enter a pool ID", description: "Include the 64-character pool ID in the JSON request." },
  invalid_pool_id: { title: "That pool ID is not valid", description: "Pool IDs are exactly 64 hexadecimal characters." },
  pool_not_found: { title: "Pool not found on this network", description: "Check the selected network and confirm the pool ID." },
  invalid_amount: { title: "Check the calculation values", description: "Use positive decimal amounts with at most seven fractional digits and a valid action." },
  insufficient_shares: { title: "Not enough pool shares", description: "Lower the withdrawal share amount to the pool's total shares or less." },
  rate_limited: { title: "Horizon is rate limiting this request", description: "Wait a moment before calculating this pool again." },
  request_failed: { title: "Could not read the pool", description: "Horizon did not return a usable pool response. Check the network and retry." }
};
