export interface FederationAddress {
  name: string;
  domain: string;
}

export type FederationMemoType = "text" | "id" | "hash" | "return";

export interface FederationRecord {
  accountId: string;
  memoType?: FederationMemoType;
  memo?: string;
}

export interface FederationResolution {
  address: FederationAddress;
  record: FederationRecord;
  /** The federation server URL discovered from the domain's stellar.toml. */
  federationServer: string;
  tomlUrl: string;
}

export type FederationErrorCode =
  | "empty_input"
  | "invalid_syntax"
  | "toml_not_found"
  | "toml_malformed"
  | "no_federation_server"
  | "https_required"
  | "name_not_found"
  | "federation_malformed"
  | "federation_server_error"
  | "invalid_account_id"
  | "invalid_memo"
  | "timeout"
  | "network_error";
