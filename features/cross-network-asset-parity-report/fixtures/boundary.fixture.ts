import { downIssuer, leftIssuer, matchingPair, missingIssuer, pairsJson, rightIssuer } from "@/features/cross-network-asset-parity-report/fixtures/normal.fixture"

export const reusedCodePair = pairsJson([
  matchingPair,
  {
    id: "pair-reused",
    left: { network: "testnet", code: "USDC", issuer: leftIssuer },
    right: { network: "testnet", code: "USDC", issuer: rightIssuer }
  }
])

export const missingSidePair = pairsJson([
  {
    id: "pair-missing",
    left: { network: "testnet", code: "USDC", issuer: leftIssuer },
    right: { network: "mainnet", code: "USDC", issuer: missingIssuer }
  }
])

export const downNetworkPair = pairsJson([
  {
    id: "pair-down",
    left: { network: "testnet", code: "USDC", issuer: leftIssuer },
    right: { network: "mainnet", code: "USDC", issuer: downIssuer }
  }
])

export const duplicatePairs = pairsJson([matchingPair, { ...matchingPair, id: "pair-copy" }])

export const nativePair = pairsJson([
  {
    id: "pair-xlm",
    left: { network: "testnet", code: "XLM", issuer: leftIssuer },
    right: { network: "mainnet", code: "XLM", issuer: rightIssuer }
  }
])
