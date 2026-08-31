import { describe, expect, it } from "vitest";
import { parseCurrencies } from "@/features/asset-metadata/lib/tomlParser";
import {
  declaredFields,
  formatAssetIdentity,
  formatFetchedAt,
  isUnpinned
} from "@/features/asset-metadata/lib/format";
import {
  issuerA,
  issuerB,
  malformedToml,
  tomlWithComments,
  tomlWithTwoCurrencies,
  tomlWithUnpinnedCurrency,
  tomlWithoutCurrencies
} from "@/features/asset-metadata/fixtures/assetMetadata.fixture";

describe("parseCurrencies", () => {
  it("reads every [[CURRENCIES]] entry", () => {
    const currencies = parseCurrencies(tomlWithTwoCurrencies);

    expect(currencies).toHaveLength(2);
    expect(currencies[0]).toMatchObject({
      code: "USDC",
      issuer: issuerA,
      name: "USD Coin",
      image: "https://example.com/usdc.png"
    });
    expect(currencies[1]).toMatchObject({ code: "EURC", issuer: issuerB, name: "Euro Coin" });
  });

  it("accepts double-quoted, single-quoted and bare values", () => {
    const [, eurc] = parseCurrencies(tomlWithTwoCurrencies);
    expect(eurc.name).toBe("Euro Coin");
    expect(eurc.homeDomain).toBe("example.com");
  });

  it("does not bleed into the next table", () => {
    const currencies = parseCurrencies(tomlWithTwoCurrencies);
    // ORG_NAME lives in [DOCUMENTATION] and must not land on a currency.
    expect(JSON.stringify(currencies)).not.toContain("Example Anchor");
  });

  it("ignores comments and blank lines", () => {
    expect(parseCurrencies(tomlWithComments)).toEqual([{ code: "USDC", issuer: issuerA }]);
  });

  it("returns an empty list when no currencies are declared", () => {
    expect(parseCurrencies(tomlWithoutCurrencies)).toEqual([]);
  });

  it("keeps an entry that declares no issuer", () => {
    expect(parseCurrencies(tomlWithUnpinnedCurrency)).toEqual([
      { code: "MYSTERY", name: "Unpinned asset" }
    ]);
  });

  it("throws on a line that is not a key/value pair", () => {
    expect(() => parseCurrencies(malformedToml)).toThrow();
  });
});

describe("formatAssetIdentity", () => {
  it("uses CODE:ISSUER when an issuer is declared", () => {
    expect(formatAssetIdentity({ code: "USDC", issuer: issuerA })).toBe(`USDC:${issuerA}`);
  });

  it("falls back to the code alone", () => {
    expect(formatAssetIdentity({ code: "MYSTERY" })).toBe("MYSTERY");
  });
});

describe("declaredFields", () => {
  it("marks absent fields rather than hiding them", () => {
    const fields = declaredFields({ code: "MYSTERY" });
    expect(fields.every((field) => field.value === "Not declared")).toBe(true);
  });
});

describe("isUnpinned", () => {
  it("flags an entry with no issuer", () => {
    expect(isUnpinned({ code: "MYSTERY" })).toBe(true);
    expect(isUnpinned({ code: "USDC", issuer: issuerA })).toBe(false);
  });
});

describe("formatFetchedAt", () => {
  it("renders an ISO timestamp readably", () => {
    expect(formatFetchedAt("2026-05-02T10:14:05.000Z")).toBe("2026-05-02 10:14:05 UTC");
  });
});
