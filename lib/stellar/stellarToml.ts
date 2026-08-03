/**
 * Stellar TOML (SEP-0001) metadata discovery utility.
 *
 * Fetches /.well-known/stellar.toml from a given domain and parses the
 * declared CURRENCIES section. Only HTTPS domains are accepted. The raw
 * fetch URL and timestamp are returned alongside any parsed currencies so
 * the caller can show full provenance.
 *
 * Security notes:
 *  - Only the well-known path is constructed here; callers cannot inject
 *    arbitrary URL paths.
 *  - External image URLs and home-domain values are passed through as-is
 *    and must be treated as untrusted content by the UI.
 *  - Responses larger than MAX_TOML_BYTES are rejected before parsing.
 *  - A 10-second timeout is applied to every request.
 */

/** Maximum accepted TOML file size (100 KiB). */
const MAX_TOML_BYTES = 100 * 1024;

/** Fetch timeout in milliseconds. */
const FETCH_TIMEOUT_MS = 10_000;

export interface TomlCurrency {
  code: string;
  issuer?: string;
  name?: string;
  desc?: string;
  image?: string;
  home_domain?: string;
}

export interface StellarTomlResult {
  /** The exact URL that was fetched (always /.well-known/stellar.toml). */
  fetchUrl: string;
  /** ISO-8601 timestamp of when the response was received. */
  fetchedAt: string;
  /** Parsed CURRENCIES entries. May be empty if none are declared. */
  currencies: TomlCurrency[];
  /** Raw TOML text for reference. */
  rawToml: string;
}

// ---------------------------------------------------------------------------
// Domain normalisation
// ---------------------------------------------------------------------------

/**
 * Normalises a raw input into a plain HTTPS origin (scheme + host + optional port).
 * Throws a descriptive Error for any unsafe or malformed input.
 *
 * Accepted forms:
 *   example.com
 *   https://example.com
 *   https://example.com/any/path  (path is stripped)
 *
 * Rejected forms:
 *   http://…   (non-HTTPS)
 *   ftp://…    (non-HTTPS)
 *   //example.com (protocol-relative)
 */
export function normaliseDomain(raw: string): string {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error("Enter a domain such as example.com.");
  }

  // Reject protocol-relative URLs
  if (trimmed.startsWith("//")) {
    throw new Error("Only HTTPS domains are accepted. Enter a domain without a leading //.");
  }

  // Explicitly reject non-HTTPS schemes
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):\/\//);
  if (schemeMatch && schemeMatch[1].toLowerCase() !== "https") {
    throw new Error(
      `Only HTTPS domains are accepted. "${schemeMatch[1]}" is not allowed.`
    );
  }

  // Prefix https:// if no scheme is present so URL() can parse it
  const withScheme = trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error("The domain could not be parsed. Enter a valid hostname such as example.com.");
  }

  if (!parsed.hostname) {
    throw new Error("No hostname found. Enter a domain such as example.com.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Credentials are not allowed in issuer-domain inputs.");
  }

  const hostnamePattern =
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

  const isIpv4Address = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(parsed.hostname);

  if (isIpv4Address || !hostnamePattern.test(parsed.hostname)) {
    throw new Error("Enter a valid DNS hostname such as example.com.");
  }

  // Return only scheme + host + port (strip path, query, hash)
  return parsed.port
    ? `${parsed.protocol}//${parsed.hostname}:${parsed.port}`
    : `${parsed.protocol}//${parsed.hostname}`;
}

// ---------------------------------------------------------------------------
// Minimal TOML parser for stellar.toml CURRENCIES blocks
// ---------------------------------------------------------------------------

/**
 * Parses a stellar.toml text and extracts CURRENCIES array entries.
 *
 * stellar.toml uses a restricted TOML subset. Each currency is an array of
 * tables:
 *
 *   [[CURRENCIES]]
 *   code = "USDC"
 *   issuer = "G…"
 *
 * This parser handles that pattern without pulling in a full TOML library.
 * Keys outside CURRENCIES are intentionally ignored.
 */
export function parseStellarTomlCurrencies(toml: string): TomlCurrency[] {
  const currencies: TomlCurrency[] = [];
  // Split on [[CURRENCIES]] headers (case-insensitive)
  const blocks = toml.split(/\[\[CURRENCIES\]\]/i);

  // First element is everything before the first [[CURRENCIES]] — skip it
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const currency: TomlCurrency = { code: "" };

    // Split block on the next table-level header (either [[…]] or […])
    // so we don't bleed into sibling tables
    const blockContent = block.split(
      /^\s*\[{1,2}[^\]\r\n]+\]{1,2}\s*(?:#.*)?$/m
    )[0];

    const lines = blockContent.split(/\r?\n/);
    for (const line of lines) {
      const stripped = line.trim();
      // Skip comments and empty lines
      if (!stripped || stripped.startsWith("#")) continue;

      const eqIdx = stripped.indexOf("=");
      if (eqIdx === -1) {
        throw new Error(`Malformed TOML line in CURRENCIES: ${stripped}`);
      }

      const key = stripped.slice(0, eqIdx).trim().toLowerCase();
      const rawValue = stripped.slice(eqIdx + 1).trim();
      const supportedKeys = new Set([
        "code",
        "issuer",
        "name",
        "desc",
        "image",
        "home_domain"
      ]);

      if (!supportedKeys.has(key)) {
        continue;
      }

      const value = parseTomlStringValue(rawValue, key);

      switch (key) {
        case "code":
          currency.code = value;
          break;
        case "issuer":
          currency.issuer = value;
          break;
        case "name":
          currency.name = value;
          break;
        case "desc":
          currency.desc = value;
          break;
        case "image":
          currency.image = value;
          break;
        case "home_domain":
          currency.home_domain = value;
          break;
      }
    }

    // Only include entries that have at least a code
    if (currency.code) {
      currencies.push(currency);
    }
  }

  return currencies;
}

function parseTomlStringValue(rawValue: string, key: string): string {
  const doubleQuoted = rawValue.match(/^"((?:\\.|[^"\\])*)"\s*(?:#.*)?$/);
  if (doubleQuoted) {
    try {
      return JSON.parse(`"${doubleQuoted[1]}"`);
    } catch {
      throw new Error(`Malformed TOML string for CURRENCIES.${key}.`);
    }
  }

  const singleQuoted = rawValue.match(/^'([^']*)'\s*(?:#.*)?$/);
  if (singleQuoted) {
    return singleQuoted[1];
  }

  const bare = rawValue.match(/^([^#\s]+)\s*(?:#.*)?$/);
  if (bare) {
    return bare[1];
  }

  throw new Error(`Malformed TOML value for CURRENCIES.${key}.`);
}

// ---------------------------------------------------------------------------
// Main fetch function
// ---------------------------------------------------------------------------

/**
 * Fetches and parses a stellar.toml file from the given domain.
 *
 * @param rawDomain - User-supplied domain string (e.g. "example.com" or "https://example.com").
 * @returns Parsed result including provenance metadata and currency list.
 * @throws Descriptive Error for all failure modes:
 *   - Invalid / non-HTTPS domain
 *   - Network / CORS failure
 *   - HTTP redirect (non-2xx after redirect)
 *   - Response too large
 *   - Timeout
 *   - TOML parse failure (no currencies found is not an error)
 */
export async function fetchStellarToml(rawDomain: string): Promise<StellarTomlResult> {
  const origin = normaliseDomain(rawDomain);
  const fetchUrl = `${origin}/.well-known/stellar.toml`;

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(fetchUrl, {
      signal: controller.signal,
      redirect: "manual",
      headers: { Accept: "text/plain, text/x-toml, */*" }
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        `The request to ${fetchUrl} timed out after ${FETCH_TIMEOUT_MS / 1000} seconds.`
      );
    }
    // CORS failures and network errors surface here
    throw new Error(
      `Could not reach ${fetchUrl}. The server may be offline, block CORS, or the domain may not exist.`
    );
  } finally {
    globalThis.clearTimeout(timeoutId);
  }

  if (
    response.type === "opaqueredirect" ||
    response.redirected ||
    (response.status >= 300 && response.status < 400)
  ) {
    const redirectTarget = response.url || "an untrusted location";
    throw new Error(
      `The server attempted to redirect the stellar.toml request to ${redirectTarget}. Redirects are not followed.`
    );
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `No stellar.toml found at ${fetchUrl} (HTTP 404). The issuer may not have published SEP-0001 metadata.`
      );
    }
    throw new Error(
      `The server returned HTTP ${response.status} for ${fetchUrl}.`
    );
  }

  // Read body with size guard
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_TOML_BYTES) {
    throw new Error(
      `The stellar.toml response is too large (${contentLength} bytes). Maximum accepted size is ${MAX_TOML_BYTES / 1024} KiB.`
    );
  }

  let rawToml: string;
  try {
    rawToml = await response.text();
  } catch {
    throw new Error(`Failed to read the response body from ${fetchUrl}.`);
  }

  if (new TextEncoder().encode(rawToml).byteLength > MAX_TOML_BYTES) {
    throw new Error(
      `The stellar.toml response is too large. Maximum accepted size is ${MAX_TOML_BYTES / 1024} KiB.`
    );
  }

  const fetchedAt = new Date().toISOString();

  let currencies: TomlCurrency[];
  try {
    currencies = parseStellarTomlCurrencies(rawToml);
  } catch {
    throw new Error(
      `The TOML file at ${fetchUrl} could not be parsed. It may be malformed.`
    );
  }

  return { fetchUrl, fetchedAt, currencies, rawToml };
}
