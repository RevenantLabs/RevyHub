import { Keypair } from "@stellar/stellar-sdk";
import type { LiquidityPoolInspectorResult } from "@/features/liquidity-pool-inspector/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const issuerId = seed(2).publicKey();
export const poolId = "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7";
export const missingPoolId = "c".repeat(64);

export const horizonPoolResponse = {
  id: poolId,
  paging_token: poolId,
  fee_bp: 30,
  type: "constant_product",
  total_trustlines: "42",
  total_shares: "1000.0000000",
  reserves: [
    { asset: "native", amount: "10000.0000000" },
    { asset: `USDC:${issuerId}`, amount: "2500.0000000" }
  ],
  last_modified_ledger: 1017696,
  last_modified_time: "2026-05-02T10:14:05Z",
  _links: { self: { href: "" } }
};

export const horizonPoolWithMembers = {
  ...horizonPoolResponse,
  num_pool_members: "17",
  total_trustlines: "42"
};

export const liquidityPoolInspectorFixture: LiquidityPoolInspectorResult = {
  poolId,
  feeBp: 30,
  totalShares: "1000.0000000",
  participantCount: 42,
  participantSource: "total_trustlines",
  reserves: [
    { assetType: "native", amount: "10000.0000000" },
    { assetType: "credit", assetCode: "USDC", assetIssuer: issuerId, amount: "2500.0000000" }
  ],
  priceAToB: "0.25",
  priceBToA: "4",
  shareValueA: "10",
  shareValueB: "2.5",
  pricePrecision: 7
};

export const liquidityPoolInspectorMembersFixture: LiquidityPoolInspectorResult = {
  ...liquidityPoolInspectorFixture,
  participantCount: 17,
  participantSource: "num_pool_members"
};
