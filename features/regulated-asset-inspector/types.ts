import type { StellarNetwork } from "@/core/network/types";

export interface RegulatedAssetInspectorInput {
  issuerId: string;
  assetCode: string;
}

export interface IssuerFlagEvidence {
  authRequired: boolean;
  authRevocable: boolean;
  authImmutable: boolean;
  authClawbackEnabled: boolean;
}

export type RegulatedStatus = "regulated" | "not_regulated";

export interface RegulatedAssetInspectorResult {
  issuerId: string;
  assetCode: string;
  homeDomain: string;
  tomlUrl: string;
  network: StellarNetwork;
  regulatedStatus: RegulatedStatus;
  /** False when the matched currency omits the regulated field entirely. */
  regulatedFieldPresent: boolean;
  approvalServer: string | null;
  approvalCriteria: string | null;
  issuerFlags: IssuerFlagEvidence;
  selfPublishedNotice: string;
}

export type RegulatedAssetInspectorErrorCode =
  | "invalid_account"
  | "invalid_asset_code"
  | "account_not_found"
  | "missing_home_domain"
  | "toml_unreachable"
  | "currency_not_found"
  | "malformed_toml";

export type RegulatedAssetField = "issuerId" | "assetCode";
