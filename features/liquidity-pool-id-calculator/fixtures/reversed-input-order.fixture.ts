import { sample } from "./liquidityPoolIdCalculator.fixture";

/**
 * The same two assets as the main sample, entered in the opposite order —
 * used to prove the computed pool ID (and canonical ordering) is identical
 * regardless of which asset the caller typed first.
 */
export const reversed = {
  assetXCode: sample.assetYCode,
  assetXIssuer: sample.assetYIssuer,
  assetYCode: sample.assetXCode,
  assetYIssuer: sample.assetXIssuer,
  feeBps: sample.feeBps
};
