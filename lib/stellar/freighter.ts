import type { StellarNetwork } from "@/lib/stellar/horizon";

/**
 * Outcome of normalizing a Freighter `getNetwork()` response into an app-friendly
 * shape. We deliberately keep `unsupported` and `missing` as distinct states so
 * the UI can explain each one accurately — Freighter reporting an explicitly
 * unrecognized network is meaningfully different from Freighter not having
 * granted access yet.
 */
export type FreighterNetworkNormalization =
  | { status: "missing" }
  | { status: "supported"; network: StellarNetwork; reported: string }
  | { status: "unsupported"; reported: string };

/**
 * Strict mapping from Freighter's documented network identifiers
 * (https://docs.freighter.app/) into the app's `StellarNetwork` values.
 *
 * Strict equality (after trim + uppercase) avoids false positives from
 * permissive substring matching — for example, a custom network named
 * "mainnet-testbed" would otherwise be silently coerced into "testnet".
 *
 * - "PUBLIC"  → "mainnet"
 * - "TESTNET" → "testnet"
 * - anything else (e.g. "FUTURENET", "", undefined) → "unsupported" or "missing"
 */
export function normalizeFreighterNetwork(
  value: string | null | undefined
): FreighterNetworkNormalization {
  if (value === null || value === undefined) {
    return { status: "missing" };
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return { status: "missing" };
  }

  const normalized = trimmed.toUpperCase();

  if (normalized === "TESTNET") {
    return { status: "supported", network: "testnet", reported: trimmed };
  }

  if (normalized === "PUBLIC") {
    return { status: "supported", network: "mainnet", reported: trimmed };
  }

  return { status: "unsupported", reported: trimmed };
}
