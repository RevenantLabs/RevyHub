/** Fees are reported in stroops; 10,000,000 stroops make one XLM. */
export function stroopsToXlm(stroops: string): string {
  const value = BigInt(stroops);
  const whole = value / 10_000_000n;
  const fraction = (value % 10_000_000n).toString().padStart(7, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

export function formatFee(stroops: string): string {
  return `${stroops} stroops (${stroopsToXlm(stroops)} XLM)`;
}

const OPERATION_LABELS: Record<string, string> = {
  create_account: "Create account",
  payment: "Payment",
  path_payment_strict_receive: "Path payment (strict receive)",
  path_payment_strict_send: "Path payment (strict send)",
  manage_sell_offer: "Manage sell offer",
  manage_buy_offer: "Manage buy offer",
  create_passive_sell_offer: "Create passive sell offer",
  set_options: "Set options",
  change_trust: "Change trust",
  allow_trust: "Allow trust",
  account_merge: "Account merge",
  manage_data: "Manage data",
  bump_sequence: "Bump sequence",
  create_claimable_balance: "Create claimable balance",
  claim_claimable_balance: "Claim claimable balance",
  invoke_host_function: "Invoke host function (Soroban)"
};

export function formatOperationType(type: string): string {
  return OPERATION_LABELS[type] ?? type.replace(/_/g, " ");
}

export function formatMemo(memoType: string, memo?: string): string {
  if (memoType === "none" || !memo) return "None";
  return `${memo} (${memoType})`;
}

/** ISO-8601 from Horizon, rendered in the viewer's own locale. */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}
