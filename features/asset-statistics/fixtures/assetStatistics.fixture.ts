import { Keypair } from "@stellar/stellar-sdk";
import type { AssetStatisticsResult } from "@/features/asset-statistics/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const issuerId = seed(1).publicKey();
export const unknownIssuer = seed(2).publicKey();
export const accountId = seed(3).publicKey();

export const fixtureResult: AssetStatisticsResult = {
  assetCode: "USDC",
  issuerId,
  supply: "1234567.0000000",
  claimableBalancesAmount: "50.0000000",
  numClaimableBalances: 2,
  flags: {
    authRequired: false,
    authRevocable: true,
    authImmutable: false,
    clawbackEnabled: true
  },
  accounts: {
    authorized: 12000,
    authorizedToMaintainLiabilities: 0,
    unauthorized: 345
  },
  balances: {
    authorized: "1234567.0000000",
    authorizedToMaintainLiabilities: "0.0000000",
    unauthorized: "0.0000000"
  }
};
