import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { AnchorCurrency, AnchorDiscoveryErrorCode, AnchorDiscoveryInput, AnchorDiscoveryResult, AnchorServicePresence } from "@/features/anchor-discovery/types";

const MAX_TOML_BYTES = 100 * 1024;
const SERVICE_KEYS = {
  sep6: ["transfer_server"],
  sep10: ["web_auth_endpoint"],
  sep12: ["kyc_server"],
  sep24: ["transfer_server_sep0024"],
  sep31: ["direct_payment_server"],
  sep38: ["anchor_quote_server", "sep38"],
} as const;

function parseToml(raw: string): { values: Record<string, string>; currencies: AnchorCurrency[] } | null {
  const values: Record<string, string> = {};
  const currencies: AnchorCurrency[] = [];
  let current: AnchorCurrency | undefined;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (/^\[\[currencies\]\]$/i.test(trimmed)) { current = { code: "" }; currencies.push(current); continue; }
    if (/^\[[^\]]+\]$/.test(trimmed)) { current = undefined; continue; }
    const match = trimmed.match(/^([A-Za-z0-9_-]+)\s*=\s*(?:"((?:\\.|[^"\\])*)"|'([^']*)'|([^#\s]+))/);
    if (!match) return null;
    const key = match[1].toLowerCase();
    const value = (match[2] ?? match[3] ?? match[4] ?? "").replace(/\\"/g, '"');
    if (current && (key === "code" || key === "issuer")) {
      if (key === "code") current.code = value;
      else current.issuer = value;
    } else values[key] = value;
  }
  return { values, currencies: currencies.filter((currency) => currency.code.length > 0) };
}

export function validateAnchorDomain(domain: string): Result<{ domain: string; url: string }, AnchorDiscoveryErrorCode> {
  const value = domain.trim();
  if (!value) return err("empty_input");
  if (/^http:\/\//i.test(value)) return err("insecure_domain");
  const candidate = /^https:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return err("insecure_domain");
    if (!url.hostname || url.hostname === "localhost" || url.hostname.includes("_") || url.hostname.includes("@")) return err("invalid_domain");
    return ok({ domain: url.hostname.toLowerCase(), url: `https://${url.hostname.toLowerCase()}/.well-known/stellar.toml` });
  } catch { return err("invalid_domain"); }
}

export async function discoverAnchor(input: AnchorDiscoveryInput, options: { fetchImpl?: typeof fetch; signal?: AbortSignal } = {}): Promise<Result<AnchorDiscoveryResult, AnchorDiscoveryErrorCode>> {
  const validated = validateAnchorDomain(input.domain);
  if (!validated.ok) return validated;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  options.signal?.addEventListener("abort", () => controller.abort(), { once: true });
  let response: Response;
  try {
    response = await fetchImpl(validated.value.url, { redirect: "manual", signal: controller.signal, headers: { Accept: "text/plain, text/x-toml" } });
  } catch { clearTimeout(timeout); return err("toml_unreachable"); }
  clearTimeout(timeout);
  if (response.status >= 300 && response.status < 400) return err("toml_unreachable");
  if (!response.ok) return err("toml_unreachable");
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (declared > MAX_TOML_BYTES) return err("toml_invalid");
  let raw: string;
  try { raw = await response.text(); } catch { return err("toml_unreachable"); }
  if (new TextEncoder().encode(raw).byteLength > MAX_TOML_BYTES) return err("toml_invalid");
  const parsed = parseToml(raw);
  if (!parsed) return err("toml_invalid");
  const services: AnchorServicePresence = {
    sep6: SERVICE_KEYS.sep6.some((key) => Boolean(parsed.values[key])),
    sep10: SERVICE_KEYS.sep10.some((key) => Boolean(parsed.values[key])),
    sep12: SERVICE_KEYS.sep12.some((key) => Boolean(parsed.values[key])),
    sep24: SERVICE_KEYS.sep24.some((key) => Boolean(parsed.values[key])),
    sep31: SERVICE_KEYS.sep31.some((key) => Boolean(parsed.values[key])),
    sep38: SERVICE_KEYS.sep38.some((key) => Boolean(parsed.values[key])),
  };
  if (!Object.values(services).some(Boolean)) return err("no_services");
  return ok({
    summary: "stellar.toml discovered and SEP service endpoints classified.",
    domain: validated.value.domain,
    fetchUrl: validated.value.url,
    services,
    signingKey: parsed.values.signing_key,
    networkPassphrase: parsed.values.network_passphrase,
    currencies: parsed.currencies,
    status: "valid",
  });
}

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runAnchorDiscovery(
  input: AnchorDiscoveryInput,
  _network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<AnchorDiscoveryResult, AnchorDiscoveryErrorCode>> {
  return discoverAnchor(input, { signal });
}
