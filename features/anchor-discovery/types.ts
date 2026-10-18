export interface AnchorDiscoveryInput { domain: string; }

export interface AnchorCurrency { code: string; issuer?: string; }
export interface AnchorServicePresence {
  sep6: boolean;
  sep10: boolean;
  sep12: boolean;
  sep24: boolean;
  sep31: boolean;
  sep38: boolean;
}
export interface AnchorDiscoveryResult {
  summary: string;
  domain: string;
  fetchUrl: string;
  services: AnchorServicePresence;
  signingKey?: string;
  networkPassphrase?: string;
  currencies: AnchorCurrency[];
  status: "valid" | "services_missing";
}

export type AnchorDiscoveryErrorCode =
  | "empty_input"
  | "invalid_domain"
  | "insecure_domain"
  | "toml_unreachable"
  | "toml_invalid"
  | "no_services"
  | "request_failed";
