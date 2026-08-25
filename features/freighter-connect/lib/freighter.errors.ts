import type { WalletNetwork } from "@/features/freighter-connect/types";

/**
 * Freighter reports networks as free-form strings that have changed over time
 * ("TESTNET", "PUBLIC", "Test SDF Network ; September 2015"). Matching on
 * substrings keeps this working across versions, and anything unrecognised
 * becomes `unknown` rather than being guessed at.
 */
export function normalizeWalletNetwork(raw: string | undefined): WalletNetwork {
  const value = (raw ?? "").toLowerCase();

  if (!value) return "unknown";
  if (value.includes("test")) return "testnet";
  if (value.includes("public") || value.includes("main")) return "mainnet";

  return "unknown";
}
