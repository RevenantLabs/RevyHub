import type { OperationParam, OperationSummary } from "@/features/operation-browser/types";

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
  begin_sponsoring_future_reserves: "Begin sponsoring future reserves",
  end_sponsoring_future_reserves: "End sponsoring future reserves",
  revoke_sponsorship: "Revoke sponsorship",
  clawback: "Clawback",
  clawback_claimable_balance: "Clawback claimable balance",
  set_trust_line_flags: "Set trust line flags",
  liquidity_pool_deposit: "Liquidity pool deposit",
  liquidity_pool_withdraw: "Liquidity pool withdraw",
  invoke_host_function: "Invoke host function (Soroban)",
  extend_footprint_ttl: "Extend footprint TTL",
  restore_footprint: "Restore footprint",
  inflation: "Inflation"
};

const FILTERABLE_TYPES = Object.keys(OPERATION_LABELS);

const SKIP_FIELDS = new Set([
  "_links",
  "id",
  "paging_token",
  "type",
  "type_i",
  "source_account",
  "source_account_muxed",
  "source_account_muxed_id",
  "created_at",
  "transaction_hash",
  "transaction_successful",
  "account",
  "asset_type",
  "asset_code",
  "asset_issuer",
  "sponsor",
  "from",
  "from_muxed",
  "from_muxed_id",
  "to_muxed",
  "to_muxed_id"
]);

export function listFilterableOperationTypes(): readonly string[] {
  return FILTERABLE_TYPES;
}

export function formatOperationType(type: string): string {
  return OPERATION_LABELS[type] ?? type.replace(/_/g, " ");
}

/** ISO-8601 from Horizon, rendered in a stable UTC string. */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

function humanizeField(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatAsset(record: Record<string, unknown>): string {
  const assetType = String(record.asset_type ?? "");
  if (assetType === "native") return "XLM (native)";

  const code = record.asset_code ? String(record.asset_code) : "";
  const issuer = record.asset_issuer ? String(record.asset_issuer) : "";
  if (code && issuer) return `${code}:${issuer}`;
  if (code) return code;
  return assetType || "Unknown asset";
}

function formatAmount(amount: unknown, assetLabel: string): string {
  return `${String(amount ?? "0")} ${assetLabel}`;
}

function pushParam(params: OperationParam[], label: string, value: unknown): void {
  if (value === undefined || value === null || value === "") return;
  params.push({ label, value: String(value) });
}

function summarizeUnknown(record: Record<string, unknown>): OperationParam[] {
  return Object.entries(record)
    .filter(([key, value]) => !SKIP_FIELDS.has(key) && value != null && typeof value !== "object")
    .slice(0, 8)
    .map(([key, value]) => ({ label: humanizeField(key), value: String(value) }));
}

/** Pulls the fields a human would care about for each Horizon operation type. */
export function extractOperationParams(record: Record<string, unknown>): OperationParam[] {
  const type = String(record.type);
  const params: OperationParam[] = [];
  const asset = formatAsset(record);

  switch (type) {
    case "create_account":
      pushParam(params, "New account", record.account);
      pushParam(params, "Starting balance", formatAmount(record.starting_balance, "XLM"));
      pushParam(params, "Funder", record.funder);
      break;
    case "payment":
      pushParam(params, "To", record.to);
      pushParam(params, "Amount", formatAmount(record.amount, asset));
      pushParam(params, "From", record.from);
      break;
    case "path_payment_strict_receive":
    case "path_payment_strict_send":
      pushParam(params, "From", record.from);
      pushParam(params, "To", record.to);
      pushParam(params, "Send max", formatAmount(record.source_max, formatAsset(record)));
      pushParam(params, "Amount", formatAmount(record.amount, formatAsset(record)));
      pushParam(
        params,
        "Destination asset",
        formatAsset({
          asset_type: record.destination_asset_type,
          asset_code: record.destination_asset_code,
          asset_issuer: record.destination_asset_issuer
        })
      );
      if (Array.isArray(record.path)) {
        pushParam(
          params,
          "Path",
          (record.path as Record<string, unknown>[])
            .map((hop) => formatAsset(hop))
            .join(" → ")
        );
      }
      break;
    case "manage_sell_offer":
    case "manage_buy_offer":
    case "create_passive_sell_offer":
      pushParam(params, "Offer action", record.offer_id === 0 ? "Create offer" : `Update offer ${record.offer_id}`);
      pushParam(params, "Asset", asset);
      pushParam(params, "Amount", record.amount);
      pushParam(params, "Price", record.price);
      break;
    case "change_trust":
      pushParam(params, "Asset", asset);
      pushParam(params, "Limit", record.limit);
      pushParam(params, "Trustor", record.trustor);
      break;
    case "allow_trust":
      pushParam(params, "Trustor", record.trustor);
      pushParam(params, "Asset", asset);
      pushParam(params, "Authorize", record.authorize === true ? "Yes" : "No");
      break;
    case "account_merge":
      pushParam(params, "Into account", record.into);
      break;
    case "manage_data":
      pushParam(params, "Data name", record.name);
      pushParam(params, "Value", record.value);
      break;
    case "set_options":
      if (record.low_threshold != null) pushParam(params, "Low threshold", record.low_threshold);
      if (record.med_threshold != null) pushParam(params, "Medium threshold", record.med_threshold);
      if (record.high_threshold != null) pushParam(params, "High threshold", record.high_threshold);
      if (record.master_weight != null) pushParam(params, "Master weight", record.master_weight);
      if (record.home_domain) pushParam(params, "Home domain", record.home_domain);
      if (record.inflation_dest) pushParam(params, "Inflation destination", record.inflation_dest);
      if (Array.isArray(record.set_flags_s) && record.set_flags_s.length) {
        pushParam(params, "Set flags", record.set_flags_s.join(", "));
      }
      if (Array.isArray(record.clear_flags_s) && record.clear_flags_s.length) {
        pushParam(params, "Clear flags", record.clear_flags_s.join(", "));
      }
      if (record.signer_key) {
        pushParam(params, "Signer key", record.signer_key);
        pushParam(params, "Signer weight", record.signer_weight);
      }
      if (!params.length) pushParam(params, "Change", "Account options updated");
      break;
    case "bump_sequence":
      pushParam(params, "New sequence", record.bump_to);
      break;
    case "create_claimable_balance":
      pushParam(params, "Amount", formatAmount(record.amount, asset));
      if (Array.isArray(record.claimants)) {
        pushParam(
          params,
          "Claimants",
          (record.claimants as { destination: string }[]).map((claimant) => claimant.destination).join(", ")
        );
      }
      break;
    case "claim_claimable_balance":
      pushParam(params, "Balance ID", record.balance_id);
      pushParam(params, "Claimant", record.claimant);
      break;
    case "begin_sponsoring_future_reserves":
      pushParam(params, "Sponsored account", record.sponsored_id);
      break;
    case "end_sponsoring_future_reserves":
      pushParam(params, "Change", "Sponsorship ended");
      break;
    case "revoke_sponsorship":
      pushParam(params, "Revoked account", record.account_id);
      pushParam(params, "Revoked trustline", record.trustline_id);
      pushParam(params, "Revoked offer", record.offer_id);
      pushParam(params, "Revoked data entry", record.data_name);
      pushParam(params, "Revoked claimable balance", record.claimable_balance_id);
      pushParam(params, "Revoked signer", record.signer_account_id);
      break;
    case "clawback":
      pushParam(params, "From", record.from);
      pushParam(params, "Amount", formatAmount(record.amount, asset));
      break;
    case "clawback_claimable_balance":
      pushParam(params, "Balance ID", record.balance_id);
      break;
    case "set_trust_line_flags":
      pushParam(params, "Trustor", record.trustor);
      pushParam(params, "Asset", asset);
      if (Array.isArray(record.set_flags_s) && record.set_flags_s.length) {
        pushParam(params, "Set flags", record.set_flags_s.join(", "));
      }
      if (Array.isArray(record.clear_flags_s) && record.clear_flags_s.length) {
        pushParam(params, "Clear flags", record.clear_flags_s.join(", "));
      }
      break;
    case "liquidity_pool_deposit":
      pushParam(params, "Pool ID", record.liquidity_pool_id);
      pushParam(params, "Max amount A", record.max_amount_a);
      pushParam(params, "Max amount B", record.max_amount_b);
      pushParam(params, "Min price", record.min_price);
      pushParam(params, "Max price", record.max_price);
      break;
    case "liquidity_pool_withdraw":
      pushParam(params, "Pool ID", record.liquidity_pool_id);
      pushParam(params, "Amount", record.amount);
      pushParam(params, "Min amount A", record.min_amount_a);
      pushParam(params, "Min amount B", record.min_amount_b);
      break;
    case "invoke_host_function":
      pushParam(params, "Function", record.function);
      if (Array.isArray(record.parameters)) {
        pushParam(params, "Parameters", `${(record.parameters as unknown[]).length} argument(s)`);
      }
      break;
    case "extend_footprint_ttl":
      pushParam(params, "Extend to ledger", record.extend_to);
      break;
    case "restore_footprint":
      pushParam(params, "Change", "Footprint restored");
      break;
    case "inflation":
      pushParam(params, "Change", "Inflation payout");
      break;
    default:
      return summarizeUnknown(record);
  }

  return params.length ? params : summarizeUnknown(record);
}

export function flattenLoadedOperations(pages: OperationSummary[][]): OperationSummary[] {
  return pages.flat();
}

export function filterOperations(
  operations: OperationSummary[],
  typeFilter: string
): OperationSummary[] {
  if (!typeFilter || typeFilter === "all") return operations;
  return operations.filter((operation) => operation.type === typeFilter);
}

export function formatFilterSummary(matched: number, loaded: number, typeFilter: string): string {
  if (!typeFilter || typeFilter === "all") {
    return `${loaded} loaded operation${loaded === 1 ? "" : "s"}`;
  }

  const label = formatOperationType(typeFilter);
  return `${matched} of ${loaded} loaded operation${loaded === 1 ? "" : "s"} match ${label}`;
}

export function formatPagePosition(pageIndex: number, pageCount: number): string {
  return `Page ${pageIndex + 1} of ${pageCount}`;
}
