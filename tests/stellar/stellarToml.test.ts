import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchStellarToml,
  normaliseDomain,
  parseStellarTomlCurrencies
} from "../../lib/stellar/stellarToml";

// ---------------------------------------------------------------------------
// normaliseDomain
// ---------------------------------------------------------------------------

describe("normaliseDomain", () => {
  it("accepts a bare hostname", () => {
    expect(normaliseDomain("example.com")).toBe("https://example.com");
  });

  it("accepts an https:// prefixed domain and strips path", () => {
    expect(normaliseDomain("https://example.com/some/path?q=1")).toBe("https://example.com");
  });

  it("preserves a non-standard port", () => {
    expect(normaliseDomain("https://example.com:8443")).toBe("https://example.com:8443");
  });

  it("rejects an empty string", () => {
    expect(() => normaliseDomain("   ")).toThrow(/Enter a domain/);
  });

  it("rejects http:// scheme", () => {
    expect(() => normaliseDomain("http://example.com")).toThrow(/Only HTTPS/);
  });

  it("rejects ftp:// scheme", () => {
    expect(() => normaliseDomain("ftp://example.com")).toThrow(/Only HTTPS/);
  });

  it("rejects protocol-relative URLs", () => {
    expect(() => normaliseDomain("//example.com")).toThrow(/Only HTTPS/);
  });

  it("rejects clearly malformed hostnames", () => {
    expect(() => normaliseDomain("not a domain at all")).toThrow(/could not be parsed|No hostname/);
  });

  it("rejects credentials, localhost, and IP address inputs", () => {
    expect(() => normaliseDomain("user:pass@example.com")).toThrow(/Credentials/);
    expect(() => normaliseDomain("localhost")).toThrow(/valid DNS hostname/);
    expect(() => normaliseDomain("127.0.0.1")).toThrow(/valid DNS hostname/);
  });
});

// ---------------------------------------------------------------------------
// parseStellarTomlCurrencies
// ---------------------------------------------------------------------------

const VALID_TOML = `
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

[[CURRENCIES]]
code = "USDC"
issuer = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
name = "USD Coin"
desc = "A US dollar-backed stablecoin."
image = "https://example.com/usdc.png"
home_domain = "example.com"

[[CURRENCIES]]
code = "ETH"
issuer = "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR"
name = "Ethereum"
`;

const PARTIAL_TOML = `
[[CURRENCIES]]
code = "TOKEN"
`;

const NO_CURRENCIES_TOML = `
NETWORK_PASSPHRASE="Test"
VERSION="2.0.0"
`;

const MALFORMED_BLOCK_TOML = `
[[CURRENCIES]]
code
issuer = "G123"
`;

describe("parseStellarTomlCurrencies", () => {
  it("parses a valid multi-currency TOML", () => {
    const result = parseStellarTomlCurrencies(VALID_TOML);

    expect(result).toHaveLength(2);

    expect(result[0].code).toBe("USDC");
    expect(result[0].issuer).toBe("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");
    expect(result[0].name).toBe("USD Coin");
    expect(result[0].desc).toBe("A US dollar-backed stablecoin.");
    expect(result[0].image).toBe("https://example.com/usdc.png");
    expect(result[0].home_domain).toBe("example.com");

    expect(result[1].code).toBe("ETH");
    expect(result[1].name).toBe("Ethereum");
  });

  it("returns a partial entry when optional fields are absent", () => {
    const result = parseStellarTomlCurrencies(PARTIAL_TOML);

    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("TOKEN");
    expect(result[0].issuer).toBeUndefined();
  });

  it("returns an empty array for TOML with no CURRENCIES blocks", () => {
    const result = parseStellarTomlCurrencies(NO_CURRENCIES_TOML);

    expect(result).toHaveLength(0);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseStellarTomlCurrencies("")).toHaveLength(0);
  });

  it("skips entries without a code", () => {
    const toml = `
[[CURRENCIES]]
issuer = "GABC123"
name = "No Code"
`;
    const result = parseStellarTomlCurrencies(toml);

    expect(result).toHaveLength(0);
  });

  it("throws a distinct parse error for malformed currency lines", () => {
    expect(() => parseStellarTomlCurrencies(MALFORMED_BLOCK_TOML)).toThrow(
      /Malformed TOML line/
    );
  });

  it("parses quoted values with inline comments", () => {
    const result = parseStellarTomlCurrencies(`
[[CURRENCIES]]
code = "USDC" # canonical code
name = 'USD Coin' # literal string
`);

    expect(result).toEqual([{ code: "USDC", name: "USD Coin" }]);
  });
});

// ---------------------------------------------------------------------------
// fetchStellarToml — fetch mocking
// ---------------------------------------------------------------------------

const SAMPLE_TOML_BODY = `
[[CURRENCIES]]
code = "XYZ"
issuer = "GABC"
name = "Test Token"
`;

function makeFetchResponse(
  body: string,
  options: {
    status?: number;
    ok?: boolean;
    redirected?: boolean;
    finalUrl?: string;
    contentLength?: string;
  } = {}
): Response {
  const {
    status = 200,
    ok = true,
    redirected = false,
    finalUrl = "https://example.com/.well-known/stellar.toml",
    contentLength
  } = options;

  const headers = new Headers();
  if (contentLength) headers.set("content-length", contentLength);

  return {
    ok,
    status,
    redirected,
    url: finalUrl,
    headers,
    text: () => Promise.resolve(body)
  } as unknown as Response;
}

describe("fetchStellarToml", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("fetches and parses a valid stellar.toml", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeFetchResponse(SAMPLE_TOML_BODY)));

    const result = await fetchStellarToml("example.com");

    expect(result.fetchUrl).toBe("https://example.com/.well-known/stellar.toml");
    expect(result.currencies).toHaveLength(1);
    expect(result.currencies[0].code).toBe("XYZ");
    expect(result.fetchedAt).toBeTruthy();
    expect(result.rawToml).toContain("XYZ");
  });

  it("rejects a non-HTTPS domain before fetching", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(fetchStellarToml("http://example.com")).rejects.toThrow(/Only HTTPS/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws on HTTP 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeFetchResponse("", { status: 404, ok: false }))
    );

    await expect(fetchStellarToml("example.com")).rejects.toThrow(/HTTP 404/);
  });

  it("throws a descriptive error for non-404 HTTP errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeFetchResponse("", { status: 500, ok: false }))
    );

    await expect(fetchStellarToml("example.com")).rejects.toThrow(/HTTP 500/);
  });

  it("throws when the response is too large via content-length header", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse("", { contentLength: String(200 * 1024) })
      )
    );

    await expect(fetchStellarToml("example.com")).rejects.toThrow(/too large/);
  });

  it("throws when the response body exceeds the size limit", async () => {
    const oversized = "x".repeat(200 * 1024);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeFetchResponse(oversized)));

    await expect(fetchStellarToml("example.com")).rejects.toThrow(/too large/);
  });

  it("measures the response size in UTF-8 bytes", async () => {
    const oversized = "🚀".repeat(30 * 1024);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeFetchResponse(oversized)));

    await expect(fetchStellarToml("example.com")).rejects.toThrow(/too large/);
  });

  it("throws on network / CORS failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(fetchStellarToml("example.com")).rejects.toThrow(
      /offline|CORS|does not exist/
    );
  });

  it("throws on request timeout (AbortError)", async () => {
    const abortError = new DOMException("The operation was aborted.", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(fetchStellarToml("example.com")).rejects.toThrow(/timed out/);
  });

  it("throws on cross-origin redirect", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse(SAMPLE_TOML_BODY, {
          redirected: true,
          finalUrl: "https://other-origin.net/.well-known/stellar.toml"
        })
      )
    );

    await expect(fetchStellarToml("example.com")).rejects.toThrow(
      /redirect|Redirect/
    );
  });

  it("uses manual redirect handling so an untrusted target is not followed", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeFetchResponse(SAMPLE_TOML_BODY));
    vi.stubGlobal("fetch", fetchMock);

    await fetchStellarToml("example.com");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/.well-known/stellar.toml",
      expect.objectContaining({ redirect: "manual" })
    );
  });

  it("returns empty currencies array for a valid TOML with no CURRENCIES block", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeFetchResponse('VERSION="2.0.0"\n'))
    );

    const result = await fetchStellarToml("example.com");

    expect(result.currencies).toHaveLength(0);
  });
});
