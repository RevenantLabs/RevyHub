import { Networks } from "@stellar/stellar-sdk";
import type { LayerKind, SignatureSummary } from "@/features/fee-bump-inspector/types";

const STROOPS_PER_XLM = 10_000_000n;
const XLM_DECIMALS = 7;

/**
 * Converts a stroop count to its XLM string.
 *
 * Fees are 64-bit integers, so the conversion is done with `BigInt` and string
 * padding. Dividing by 1e7 in floating point silently loses stroops once the
 * amount passes `Number.MAX_SAFE_INTEGER`.
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

const KNOWN_NETWORKS: Record<string, string> = {
  [Networks.PUBLIC]: "Public network",
  [Networks.TESTNET]: "Testnet",
  [Networks.FUTURENET]: "Futurenet"
};

/** Names a passphrase when it is one of the well-known ones. */
export function describeNetwork(passphrase: string): string {
  return KNOWN_NETWORKS[passphrase] ?? "Custom network";
}

const LAYER_LABELS: Record<LayerKind, string> = {
  outer: "Outer (fee bump)",
  inner: "Inner (executed transaction)"
};

export function formatLayer(layer: LayerKind): string {
  return LAYER_LABELS[layer];
}

/**
 * Renders signature hints as a readable list.
 *
 * A hint is the last four bytes of the signing key, not a signature and not
 * proof of anything — it only narrows down which key *claims* to have signed.
 */
export function formatSignatureHints(signatures: SignatureSummary): string {
  if (!signatures.count) return "None";
  return signatures.hints.join(", ");
}

export function formatSignatureCount(signatures: SignatureSummary): string {
  return signatures.count === 1 ? "1 signature" : `${signatures.count} signatures`;
}

const OPERATION_LABELS: Record<string, string> = {
  createAccount: "Create account",
  payment: "Payment",
  pathPaymentStrictReceive: "Path payment (strict receive)",
  pathPaymentStrictSend: "Path payment (strict send)",
  manageSellOffer: "Manage sell offer",
  manageBuyOffer: "Manage buy offer",
  createPassiveSellOffer: "Create passive sell offer",
  setOptions: "Set options",
  changeTrust: "Change trust",
  allowTrust: "Allow trust",
  accountMerge: "Account merge",
  inflation: "Inflation",
  manageData: "Manage data",
  bumpSequence: "Bump sequence",
  createClaimableBalance: "Create claimable balance",
  claimClaimableBalance: "Claim claimable balance",
  beginSponsoringFutureReserves: "Begin sponsoring future reserves",
  endSponsoringFutureReserves: "End sponsoring future reserves",
  revokeSponsorship: "Revoke sponsorship",
  clawback: "Clawback",
  clawbackClaimableBalance: "Clawback claimable balance",
  setTrustLineFlags: "Set trustline flags",
  liquidityPoolDeposit: "Liquidity pool deposit",
  liquidityPoolWithdraw: "Liquidity pool withdraw",
  invokeHostFunction: "Invoke host function (Soroban)",
  extendFootprintTtl: "Extend footprint TTL (Soroban)",
  restoreFootprint: "Restore footprint (Soroban)"
};

/** Falls back to a readable form so a new protocol operation never breaks the page. */
export function formatOperationType(name: string): string {
  return OPERATION_LABELS[name] ?? name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}
