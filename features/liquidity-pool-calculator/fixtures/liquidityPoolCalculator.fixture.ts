import { Keypair } from "@stellar/stellar-sdk";
import type { LiquidityPoolCalculatorResult } from "@/features/liquidity-pool-calculator/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const issuerId = seed(7).publicKey();
export const poolId = "a".repeat(64);
export const emptyPoolId = "b".repeat(64);
export const missingPoolId = "c".repeat(64);

export const poolResponse = {
  id: poolId,
  fee_bp: 30,
  total_shares: "1000.0000000",
  reserves: [
    { asset: "native", amount: "10000.0000000" },
    { asset: `USDC:${issuerId}`, amount: "2500.0000000" }
  ]
};

export const emptyPoolResponse = {
  id: emptyPoolId,
  fee_bp: 30,
  total_shares: "0.0000000",
  reserves: [
    { asset: "native", amount: "0.0000000" },
    { asset: `USDC:${issuerId}`, amount: "0.0000000" }
  ]
};

export const liquidityPoolCalculatorFixture: LiquidityPoolCalculatorResult = {
  poolId,
  network: "testnet",
  action: "deposit",
  reserveA: "10000.0000000",
  reserveB: "2500.0000000",
  totalShares: "1000.0000000",
  feeBp: 30,
  amountA: "100.0000000",
  amountB: "25.0000000",
  consumedA: "100",
  consumedB: "25",
  mintedShares: "10",
  minimumA: "99.5",
  minimumB: "24.875",
  currentPrice: { numerator: "1", denominator: "4", display: "1/4" },
  priceLowerBound: { numerator: "199", denominator: "800", display: "199/800" },
  priceUpperBound: { numerator: "201", denominator: "800", display: "201/800" },
  poolRatio: "1/4",
  priceImpactBps: 0,
  materiallyMovesPool: false,
  firstDeposit: false,
  detail: "Deposit mints 10 shares and consumes 100 A with 25 B."
};
