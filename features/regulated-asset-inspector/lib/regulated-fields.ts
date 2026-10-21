export interface CurrencyFields {
  code: string;
  issuer?: string;
  regulated?: boolean;
  approvalServer?: string;
  approvalCriteria?: string;
  regulatedFieldPresent: boolean;
}

const KEYS = new Set(["code", "issuer", "regulated", "approval_server", "approval_criteria"]);

export function parseRegulatedCurrencies(toml: string): CurrencyFields[] {
  const currencies: CurrencyFields[] = [];
  const blocks = toml.split(/\[\[CURRENCIES\]\]/i);

  for (let index = 1; index < blocks.length; index += 1) {
    const body = blocks[index].split(/^\s*\[{1,2}[^\]\r\n]+\]{1,2}\s*(?:#.*)?$/m)[0];
    const currency: CurrencyFields = { code: "", regulatedFieldPresent: false };

    for (const line of body.split(/\r?\n/)) {
      const stripped = line.trim();
      if (!stripped || stripped.startsWith("#")) continue;
      const equals = stripped.indexOf("=");
      if (equals === -1) throw new Error("malformed");
      const key = stripped.slice(0, equals).trim().toLowerCase();
      if (!KEYS.has(key)) continue;
      const raw = stripped.slice(equals + 1).trim();

      if (key === "regulated") {
        currency.regulatedFieldPresent = true;
        currency.regulated = parseBoolean(raw);
        continue;
      }

      const value = parseString(raw);
      if (key === "code") currency.code = value;
      else if (key === "issuer") currency.issuer = value;
      else if (key === "approval_server") currency.approvalServer = value;
      else if (key === "approval_criteria") currency.approvalCriteria = value;
    }

    if (currency.code) currencies.push(currency);
  }

  return currencies;
}

export function matchCurrency(
  currencies: CurrencyFields[],
  assetCode: string,
  issuerId: string
): CurrencyFields | null {
  return (
    currencies.find(
      (entry) =>
        entry.code.toUpperCase() === assetCode.toUpperCase() && entry.issuer === issuerId
    ) ?? null
  );
}

function parseBoolean(raw: string): boolean {
  const value = raw.replace(/\s+#.*$/, "").trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error("malformed");
}

function parseString(raw: string): string {
  const doubleQuoted = raw.match(/^"((?:\\.|[^"\\])*)"\s*(?:#.*)?$/);
  if (doubleQuoted) return JSON.parse(`"${doubleQuoted[1]}"`) as string;
  const singleQuoted = raw.match(/^'([^']*)'\s*(?:#.*)?$/);
  if (singleQuoted) return singleQuoted[1];
  const bare = raw.match(/^([^"'\s#]+)\s*(?:#.*)?$/);
  if (bare) return bare[1];
  throw new Error("malformed");
}
