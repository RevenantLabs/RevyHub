export interface TomlValidatorInput { value: string; mode: "domain" | "toml"; }
export type TomlCheckStatus = "pass" | "fail" | "not_applicable";
export interface TomlCheck { field: string; status: TomlCheckStatus; detail: string; }
export interface TomlCurrencyValidation { code: string; issuer?: string; codeValid: boolean; issuerValid: boolean; }
export interface TomlValidatorResult {
  summary: string;
  source: "fetched" | "pasted";
  origin?: string;
  checks: TomlCheck[];
  currencies: TomlCurrencyValidation[];
  warnings: string[];
  errors: string[];
  cors: { status: "pass" | "warning" | "not_checked"; detail: string };
}

export type TomlValidatorErrorCode = "empty_input" | "invalid_domain" | "toml_unreachable" | "toml_invalid" | "request_failed";
