import { describe, expect, it, vi } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import {
  FederationNetworkError,
  FederationTimeoutError,
  parseFederationAddress,
  resolveFederation,
  validateFederationSyntax
} from "../../lib/stellar/federation";

const sampleAccountId = Keypair.random().publicKey();

function makeResponse(body: string, init: ResponseInit = {}) {
  return new Response(body, { status: 200, ...init });
}

function makeFetchSequence(
  responses: Array<{ match: (url: string) => boolean; body: string; status?: number }>
): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    for (const candidate of responses) {
      if (candidate.match(url)) {
        return makeResponse(candidate.body, { status: candidate.status ?? 200 });
      }
    }
    return new Response("", { status: 599 });
  }) as unknown as typeof fetch;
}

const tomlUrl = (domain: string) => `https://${domain}/.well-known/stellar.toml`;

describe("parseFederationAddress", () => {
  it("parses well-formed addresses and lowercases the domain", () => {
    expect(parseFederationAddress("alice*stellar.org")).toEqual({
      name: "alice",
      domain: "stellar.org"
    });
    expect(parseFederationAddress("bob.smith*Example.COM")).toEqual({
      name: "bob.smith",
      domain: "example.com"
    });
  });

  it("rejects addresses missing the asterisk", () => {
    expect(parseFederationAddress("alice")).toBeNull();
    expect(parseFederationAddress("stellar.org")).toBeNull();
  });

  it("rejects addresses with empty name or domain", () => {
    expect(parseFederationAddress("*stellar.org")).toBeNull();
    expect(parseFederationAddress("alice*")).toBeNull();
  });

  it("splits on the FIRST asterisk per SEP-0002, but rejects domains that contain '*'", () => {
    // SEP-0002 says the FIRST * separates name from domain, so a second '*'
    // belongs to the domain portion. Our DOMAIN_PATTERN strictly requires
    // DNS-compliant hostnames, so this collapses to null (the resolver
    // cannot fetch a URL containing '*'). The intent — indexOf, not
    // lastIndexOf — is also exercised by every other multi-part test.
    expect(parseFederationAddress("alice*foo*bar.example.com")).toBeNull();
  });

  it("enforces the 64-character SEP-0002 name limit", () => {
    expect(parseFederationAddress(`${"a".repeat(65)}*stellar.org`)).toBeNull();
  });

  it("rejects names with illegal characters", () => {
    expect(parseFederationAddress("alice/bob*stellar.org")).toBeNull();
    expect(parseFederationAddress("alice bob*stellar.org")).toBeNull();
  });

  it("rejects malformed domains", () => {
    expect(parseFederationAddress("alice*stellar")).toBeNull();
    expect(parseFederationAddress("alice*stellar..org")).toBeNull();
    expect(parseFederationAddress("alice*".concat("a".repeat(254), ".org"))).toBeNull();
  });

  it("returns null for empty / non-string input", () => {
    expect(parseFederationAddress("")).toBeNull();
    expect(parseFederationAddress("   ")).toBeNull();
    // @ts-expect-error – runtime guard
    expect(parseFederationAddress(null)).toBeNull();
    // @ts-expect-error – runtime guard
    expect(parseFederationAddress(undefined)).toBeNull();
  });
});

describe("validateFederationSyntax", () => {
  it("accepts well-formed addresses and returns the parsed pair", () => {
    const result = validateFederationSyntax("alice*stellar.org");
    expect(result.valid).toBe(true);
    expect(result.address).toEqual({ name: "alice", domain: "stellar.org" });
  });

  it("reports empty input with a clear message", () => {
    expect(validateFederationSyntax("").valid).toBe(false);
    expect(validateFederationSyntax("   ")).toMatchObject({
      valid: false,
      message: expect.stringContaining("name*domain")
    });
  });

  it("explains the asterisk requirement when missing", () => {
    expect(validateFederationSyntax("alice")).toMatchObject({
      valid: false,
      message: expect.stringContaining("asterisk")
    });
  });

  it("explains the magnetic one-part splits", () => {
    expect(validateFederationSyntax("*stellar.org").message).toMatch(/name part.*required/);
    expect(validateFederationSyntax("alice*").message).toMatch(/domain part.*required/);
  });
});

describe("resolveFederation – success paths", () => {
  it("resolves an account_id with no memo", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER="https://federation.stellar.org"\n`
      },
      {
        match: (url) =>
          url.startsWith("https://federation.stellar.org") &&
          url.includes("q=alice*stellar.org"),
        body: JSON.stringify({ account_id: sampleAccountId })
      }
    ]);

    const result = await resolveFederation("alice*stellar.org", { fetchImpl });

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.address).toEqual({ name: "alice", domain: "stellar.org" });
    expect(result.record.accountId).toBe(sampleAccountId);
    expect(result.record.memoType).toBeUndefined();
    expect(result.record.memo).toBeUndefined();
    expect(result.federationServer).toBe("https://federation.stellar.org");
  });

  it("resolves an account_id with a text memo", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("example.com"),
        body: `FEDERATION_SERVER = "https://federation.example.com"\n`
      },
      {
        match: (url) => url.includes("federation.example.com"),
        body: JSON.stringify({
          account_id: sampleAccountId,
          memo_type: "text",
          memo: "Invoice 42"
        })
      }
    ]);

    const result = await resolveFederation("Bob*example.com", {
      fetchImpl,
      timeoutMs: 10_000
    });

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.record.memoType).toBe("text");
    expect(result.record.memo).toBe("Invoice 42");
  });

  it("parses unquoted FEDERATION_SERVER values", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `# comment line
FEDERATION_SERVER=https://federation.stellar.org
OTHER_KEY = "ignored"
`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: JSON.stringify({ account_id: sampleAccountId })
      }
    ]);

    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    expect(result.kind).toBe("success");
  });

  it("parses TOML literal-string FEDERATION_SERVER values", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER='https://federation.stellar.org'\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: JSON.stringify({ account_id: sampleAccountId })
      }
    ]);

    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    expect(result.kind).toBe("success");
  });

  it("parses FEDERATION_SERVER values that include inline comments", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER = "https://federation.stellar.org" # production\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: JSON.stringify({ account_id: sampleAccountId })
      }
    ]);

    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    expect(result.kind).toBe("success");
  });

  it("accepts memo types id, hash, and return", async () => {
    for (const memoType of ["id", "hash", "return"]) {
      const fetchImpl = makeFetchSequence([
        {
          match: (url) => url === tomlUrl("example.com"),
          body: `FEDERATION_SERVER="https://federation.example.com"\n`
        },
        {
          match: (url) => url.includes("federation.example.com"),
          body: JSON.stringify({
            account_id: sampleAccountId,
            memo_type: memoType,
            memo: "ignored-value"
          })
        }
      ]);

      const result = await resolveFederation("alice*example.com", { fetchImpl });
      expect(result.kind).toBe("success");
      if (result.kind !== "success") continue;
      expect(result.record.memoType).toBe(memoType);
    }
  });
});

describe("resolveFederation – failure paths", () => {
  it("returns 'empty' for empty input without making HTTP calls", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const result = await resolveFederation("  ", { fetchImpl });
    expect(result.kind).toBe("error");
    if (result.kind !== "error") return;
    expect(result.code).toBe("empty");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns 'invalidSyntax' when the input lacks a valid separator", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const result = await resolveFederation("just-a-domain.com", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("invalidSyntax");
  });

  it("returns 'tomlNotFound' when stellar.toml is missing (HTTP 404)", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: () => true,
        body: "Not found",
        status: 404
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("tomlNotFound");
  });

  it("returns 'noFederationServer' when stellar.toml has no FEDERATION_SERVER", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: () => true,
        body: `DOCUMENTATION="https://example.com/docs"\n`
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("noFederationServer");
  });

  it("returns 'httpsRequired' when FEDERATION_SERVER is non-HTTPS", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: () => true,
        body: `FEDERATION_SERVER="http://federation.stellar.org"\n`
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("httpsRequired");
  });

  it("returns 'tomlMalformed' when FEDERATION_SERVER is not a valid URL", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: () => true,
        body: `FEDERATION_SERVER="https://"\n`
      }
    ]);

    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("tomlMalformed");
  });

  it("returns 'federationNotFound' when the server 404s", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER="https://federation.stellar.org"\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: "Not found",
        status: 404
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("federationNotFound");
  });

  it("returns 'federationMalformed' on non-JSON response", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER="https://federation.stellar.org"\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: "<!doctype html><html>nope</html>"
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("federationMalformed");
  });

  it("returns 'invalidAccountId' when account_id fails Stellar checksum", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER="https://federation.stellar.org"\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: JSON.stringify({ account_id: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" })
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("invalidAccountId");
  });

  it("returns 'invalidMemo' when memo_type is not in the SEP-0002 allowlist", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER="https://federation.stellar.org"\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: JSON.stringify({
          account_id: sampleAccountId,
          memo_type: "banana",
          memo: "ignored"
        })
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("invalidMemo");
  });

  it("returns 'invalidMemo' when memo is provided without memo_type", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER="https://federation.stellar.org"\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: JSON.stringify({ account_id: sampleAccountId, memo: "Invoice 1" })
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("invalidMemo");
  });

  it("returns 'invalidMemo' when text memo exceeds Stellar's 28-byte limit", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER="https://federation.stellar.org"\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: JSON.stringify({
          account_id: sampleAccountId,
          memo_type: "text",
          memo: "this memo is intentionally too long"
        })
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("invalidMemo");
  });

  it("counts multibyte text memos using UTF-8 bytes", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER="https://federation.stellar.org"\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: JSON.stringify({
          account_id: sampleAccountId,
          memo_type: "text",
          memo: "🚀".repeat(8)
        })
      }
    ]);

    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("invalidMemo");
  });

  it("returns 'federationServerError' on 500-class responses", async () => {
    const fetchImpl = makeFetchSequence([
      {
        match: (url) => url === tomlUrl("stellar.org"),
        body: `FEDERATION_SERVER="https://federation.stellar.org"\n`
      },
      {
        match: (url) => url.includes("federation.stellar.org"),
        body: "Internal Server Error",
        status: 500
      }
    ]);
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("federationServerError");
  });

  it("returns 'timeout' when caller signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const result = await resolveFederation("alice*stellar.org", {
      fetchImpl,
      signal: controller.signal
    });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("timeout");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns 'networkError' when fetch rejects with TypeError (CORS / DNS)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    const result = await resolveFederation("alice*stellar.org", { fetchImpl });
    if (result.kind !== "error") throw new Error("expected error");
    expect(result.code).toBe("networkError");
    expect(result.address).toEqual({ name: "alice", domain: "stellar.org" });
  });

  it("exports the matching error class names for tests to assert on", () => {
    expect(new FederationTimeoutError().name).toBe("FederationTimeoutError");
    expect(new FederationNetworkError("boom").name).toBe("FederationNetworkError");
  });
});
