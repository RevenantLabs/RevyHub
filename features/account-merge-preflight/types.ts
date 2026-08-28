export interface AccountMergePreflightInput {
  sourceAccountId: string;
  destinationAccountId: string;
}

export type AccountMergeCheckId =
  | "destination_exists"
  | "trustlines"
  | "offers"
  | "data_entries"
  | "sponsorships"
  | "signer_weight"
  | "immutable_auth"
  | "destination_capacity";

export interface AccountMergeCheck {
  id: AccountMergeCheckId;
  passed: boolean;
  blockerCount: number;
}

export type AccountMergeBlocker =
  | {
      kind: "trustline";
      subentryType: "trustline" | "liquidity_pool";
      asset: string;
      balance: string;
    }
  | { kind: "offer"; id: string; selling: string; buying: string }
  | { kind: "data_entry"; name: string }
  | { kind: "sponsorship"; count: bigint }
  | { kind: "signer_weight"; required: bigint; configured: bigint }
  | { kind: "immutable_auth" }
  | {
      kind: "destination_capacity";
      transferableXlm: string;
      maximumReceivableXlm: string;
    };

export interface AccountMergePreflightResult {
  sourceAccountId: string;
  destinationAccountId: string;
  mergeable: boolean;
  transferableXlm: string;
  destinationMaximumReceivableXlm: string;
  requiredSignerWeight: bigint;
  configuredSignerWeight: bigint;
  sponsoredSubentryCount: bigint;
  checks: AccountMergeCheck[];
  blockers: AccountMergeBlocker[];
}

export interface HorizonBalance {
  asset_type: string;
  balance: string;
  asset_code?: string;
  asset_issuer?: string;
  liquidity_pool_id?: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
}

export interface HorizonMergeAccount {
  account_id: string;
  balances: HorizonBalance[];
  data: Record<string, string>;
  flags: { auth_immutable: boolean };
  thresholds: { high_threshold: number };
  signers: Array<{ key: string; weight: number }>;
  num_sponsoring: number | string;
  num_sponsored: number | string;
}

export interface HorizonOfferAsset {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface HorizonOffer {
  id: string | number;
  paging_token: string;
  selling: HorizonOfferAsset;
  buying: HorizonOfferAsset;
}

export type AccountMergePreflightErrorCode =
  | "empty_source"
  | "invalid_source"
  | "empty_destination"
  | "invalid_destination"
  | "same_account"
  | "source_not_found"
  | "destination_not_found"
  | "request_failed";

export type AccountMergeField = "sourceAccountId" | "destinationAccountId";
