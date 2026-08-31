import { err, ok, type Result } from "@/core/result/result";
import { StrKey } from "@stellar/stellar-sdk";
import type { StellarNetwork } from "@/core/network/types";
import type { TomlCheck, TomlCurrencyValidation, TomlValidatorErrorCode, TomlValidatorInput, TomlValidatorResult } from "@/features/toml-validator/types";

const MAX_TOML_BYTES = 100 * 1024;
const SEP1_FIELDS: Array<{ field: string; required: boolean }> = [
  { field: "ORG_NAME", required: true },
  { field: "ORG_URL", required: true },
  { field: "ORG_LOGO", required: false },
  { field: "ORG_DESCRIPTION", required: false },
  { field: "ACCOUNTS", required: true },
  { field: "SIGNING_KEY", required: false },
  { field: "NETWORK_PASSPHRASE", required: false },
];

type ParsedToml = { values: Record<string, string>; currencies: Array<{ code: string; issuer?: string }> };

function parseToml(raw: string): ParsedToml | null {
  const values: Record<string, string> = {};
  const currencies: Array<{ code: string; issuer?: string }> = [];
  let currency: { code: string; issuer?: string } | undefined;
  for (const line of raw.split(/\r?\n/)) {
    const text = line.trim();
    if (!text || text.startsWith("#")) continue;
    if (/^\[\[currencies\]\]$/i.test(text)) { currency = { code: "" }; currencies.push(currency); continue; }
    if (/^\[[^\]]+\]$/.test(text)) { currency = undefined; continue; }
    const match = text.match(/^([A-Za-z0-9_-]+)\s*=\s*(?:"((?:\\.|[^"\\])*)"|'([^']*)'|([^#\s]+))/);
    if (!match) return null;
    const key = match[1].toUpperCase();
    const value = (match[2] ?? match[3] ?? match[4] ?? "").replace(/\\"/g, '"');
    if (currency && key === "CODE") currency.code = value;
    else if (currency && key === "ISSUER") currency.issuer = value;
    else values[key] = value;
  }
  return { values, currencies: currencies.filter((item) => item.code.length > 0) };
}

function validateParsed(parsed: ParsedToml, source: "fetched" | "pasted", origin?: string, cors: TomlValidatorResult["cors"] = { status: "not_checked", detail: "CORS is not applicable to pasted TOML." }): Result<TomlValidatorResult, TomlValidatorErrorCode> {
  const checks: TomlCheck[] = SEP1_FIELDS.map(({ field, required }) => {
    const value = parsed.values[field];
    if (value) return { field, status: "pass", detail: `${field} is present.` };
    return { field, status: required ? "fail" : "not_applicable", detail: required ? `${field} is required by this validator.` : `${field} is optional and was not declared.` };
  });
  if (parsed.values.SIGNING_KEY) checks.push({ field: "SIGNING_KEY.checksum", status: StrKey.isValidEd25519PublicKey(parsed.values.SIGNING_KEY) ? "pass" : "fail", detail: "Signing key checksum is checked with Stellar StrKey." });
  const currencies: TomlCurrencyValidation[] = parsed.currencies.map((currency) => ({ code: currency.code, issuer: currency.issuer, codeValid: /^[A-Z0-9]{1,12}$/.test(currency.code), issuerValid: currency.issuer ? StrKey.isValidEd25519PublicKey(currency.issuer) : true }));
  const errors = checks.filter((check) => check.status === "fail").map((check) => check.field);
  for (const currency of currencies) {
    if (!currency.codeValid) errors.push(`CURRENCIES.${currency.code}.code`);
    if (!currency.issuerValid) errors.push(`CURRENCIES.${currency.code}.issuer`);
  }
  const warnings = currencies.filter((currency) => currency.code !== "XLM" && !currency.issuer).map((currency) => `CURRENCIES.${currency.code}.issuer is absent for a non-native asset.`);
  return ok({ summary: errors.length === 0 ? "stellar.toml passed the available SEP-1 checks." : "stellar.toml has SEP-1 validation errors.", source, origin, checks, currencies, warnings, errors, cors });
}

export async function validateToml(input: TomlValidatorInput, options: { fetchImpl?: typeof fetch; signal?: AbortSignal } = {}): Promise<Result<TomlValidatorResult, TomlValidatorErrorCode>> {
  if (input.mode === "toml") {
    if (new TextEncoder().encode(input.value).byteLength > MAX_TOML_BYTES) return err("toml_invalid");
    const parsed = parseToml(input.value);
    return parsed ? validateParsed(parsed, "pasted") : err("toml_invalid");
  }
  const domain = input.value.trim();
  if (!domain) return err("empty_input");
  if (/^http:\/\//i.test(domain)) return err("invalid_domain");
  const hostInput = domain.replace(/^https:\/\//i, "");
  let hostname: string;
  try {
    const parsedHost = new URL(`https://${hostInput}`);
    if (parsedHost.hostname === "localhost" || parsedHost.hostname.includes("_") || parsedHost.username || parsedHost.password) return err("invalid_domain");
    hostname = parsedHost.hostname.toLowerCase();
  } catch { return err("invalid_domain"); }
  const url = `https://${hostname}/.well-known/stellar.toml`;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  options.signal?.addEventListener("abort", () => controller.abort(), { once: true });
  let response: Response;
  try { response = await fetchImpl(url, { redirect: "manual", signal: controller.signal, headers: { Accept: "text/plain, text/x-toml" } }); } catch { clearTimeout(timeout); return err("toml_unreachable"); }
  clearTimeout(timeout);
  if (!response.ok || (response.status >= 300 && response.status < 400)) return err("toml_unreachable");
  const raw = await response.text().catch(() => "");
  if (!raw || new TextEncoder().encode(raw).byteLength > MAX_TOML_BYTES) return err("toml_invalid");
  const parsed = parseToml(raw);
  if (!parsed) return err("toml_invalid");
  const allowOrigin = response.headers.get("access-control-allow-origin");
  const cors = allowOrigin === "*" || allowOrigin?.toLowerCase() === `https://${hostname}`
    ? { status: "pass" as const, detail: "The fetched response allows browser access." }
    : { status: "warning" as const, detail: "No matching Access-Control-Allow-Origin header was returned." };
  return validateParsed(parsed, "fetched", url, cors);
}

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runTomlValidator(
  input: TomlValidatorInput,
  _network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<TomlValidatorResult, TomlValidatorErrorCode>> {
  return validateToml(input, { signal });
}
