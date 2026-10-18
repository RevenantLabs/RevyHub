export interface TomlCurrency {
  code: string;
  issuer?: string;
  name?: string;
  desc?: string;
  image?: string;
  homeDomain?: string;
}

export interface TomlResult {
  /** The exact URL fetched — always the well-known path. */
  fetchUrl: string;
  fetchedAt: string;
  currencies: TomlCurrency[];
  rawToml: string;
}

export interface DomainInput {
  /** Scheme and host only; any path the user typed is stripped. */
  origin: string;
}

export type AssetMetadataErrorCode =
  | "empty_input"
  | "insecure_scheme"
  | "invalid_domain"
  | "toml_not_found"
  | "redirect_refused"
  | "response_too_large"
  | "toml_malformed"
  | "timeout"
  | "network_error"
  | "server_error";
