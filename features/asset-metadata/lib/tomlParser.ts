import type { TomlCurrency } from "@/features/asset-metadata/types";

const SUPPORTED_KEYS = new Set(["code", "issuer", "name", "desc", "image", "home_domain"]);

/**
 * Extracts `[[CURRENCIES]]` entries from a stellar.toml.
 *
 * stellar.toml uses a small, well-defined TOML subset, so this reads the array
 * of tables directly rather than pulling in a full TOML parser. Keys outside
 * CURRENCIES are ignored on purpose — this tool reports declared assets, not
 * the whole file.
 */
export function parseCurrencies(toml: string): TomlCurrency[] {
  const currencies: TomlCurrency[] = [];
  const blocks = toml.split(/\[\[CURRENCIES\]\]/i);

  // Everything before the first header belongs to no currency.
  for (let index = 1; index < blocks.length; index += 1) {
    // Stop at the next table header so a block never bleeds into its sibling.
    const body = blocks[index].split(/^\s*\[{1,2}[^\]\r\n]+\]{1,2}\s*(?:#.*)?$/m)[0];
    const currency: TomlCurrency = { code: "" };

    for (const line of body.split(/\r?\n/)) {
      const stripped = line.trim();
      if (!stripped || stripped.startsWith("#")) continue;

      const equals = stripped.indexOf("=");
      if (equals === -1) throw new Error("Malformed TOML line in CURRENCIES");

      const key = stripped.slice(0, equals).trim().toLowerCase();
      if (!SUPPORTED_KEYS.has(key)) continue;

      const value = parseTomlString(stripped.slice(equals + 1).trim());

      if (key === "code") currency.code = value;
      else if (key === "issuer") currency.issuer = value;
      else if (key === "name") currency.name = value;
      else if (key === "desc") currency.desc = value;
      else if (key === "image") currency.image = value;
      else if (key === "home_domain") currency.homeDomain = value;
    }

    // An entry with no code identifies nothing, so it is not reported.
    if (currency.code) currencies.push(currency);
  }

  return currencies;
}

function parseTomlString(raw: string): string {
  const doubleQuoted = raw.match(/^"((?:\\.|[^"\\])*)"\s*(?:#.*)?$/);
  if (doubleQuoted) {
    try {
      return JSON.parse(`"${doubleQuoted[1]}"`) as string;
    } catch {
      throw new Error("Malformed TOML string");
    }
  }

  const singleQuoted = raw.match(/^'([^']*)'\s*(?:#.*)?$/);
  if (singleQuoted) return singleQuoted[1];

  const bare = raw.match(/^([^"'\s#]+)\s*(?:#.*)?$/);
  if (bare) return bare[1];

  throw new Error("Malformed TOML value");
}
