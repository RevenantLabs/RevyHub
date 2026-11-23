import { Networks } from "@stellar/stellar-sdk";
import { formatFeeDelta } from "@/features/fee-bump-replacement-comparator/lib/outer-fee-diff";
import type {
  InnerIdentityReason,
  OuterFeeComparisonResult
} from "@/features/fee-bump-replacement-comparator/types";

const STROOPS_PER_XLM = 10_000_000n;
const XLM_DECIMALS = 7;

/**
 * Converts a stroop count to its XLM string without floating point.
 *
 * Fees are 64-bit integers; dividing by 1e7 in floating point silently loses
 * stroops once the amount passes `Number.MAX_SAFE_INTEGER`.
 */
export function stroopsToXlm(stroops: string): string {
  const value = BigInt(stroops);
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / STROOPS_PER_XLM;
  const fraction = (absolute % STROOPS_PER_XLM).toString().padStart(XLM_DECIMALS, "0");

  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

export function formatFee(stroops: string): string {
  return `${stroops} stroops (${stroopsToXlm(stroops)} XLM)`;
}

export function formatSignatureCount(count: number): string {
  return count === 1 ? "1 signature" : `${count} signatures`;
}

export function formatOperationCount(count: number): string {
  return count === 1 ? "1 operation" : `${count} operations`;
}

const KNOWN_NETWORKS: Record<string, string> = {
  [Networks.PUBLIC]: "Public network",
  [Networks.TESTNET]: "Testnet",
  [Networks.FUTURENET]: "Futurenet"
};

/** Names a passphrase when it is one of the well-known ones. */
export function describeNetwork(passphrase: string): string {
  return KNOWN_NETWORKS[passphrase] ?? "Custom network";
}

export function formatOuterFeeDelta(outer: OuterFeeComparisonResult): string {
  return `${formatFeeDelta(outer.feeDelta)} stroops`;
}

export function truncateHash(hash: string, keep = 8): string {
  if (hash.length <= keep * 2) return hash;
  return `${hash.slice(0, keep)}…${hash.slice(-keep)}`;
}

export function formatInnerIdentityReason(reason: InnerIdentityReason): string {
  switch (reason) {
    case "equivalent":
      return "equivalent";
    case "hash_mismatch":
      return "inner hashes differ";
    case "payload_mismatch":
      return "inner payloads differ";
    case "hash_and_payload_mismatch":
      return "inner hashes and payloads differ";
  }
}
