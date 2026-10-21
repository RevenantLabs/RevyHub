import { describe, expect, it } from "vitest";
import { HttpResponse, http, withMswHandlers } from "@/core/testing/msw";
import {
  QUOTE_SERVER,
  TOML_URL,
  tomlBare,
  tomlBrokenQuoteServer,
  tomlCommentedOnly,
  tomlDocument,
  tomlHttpQuoteServer,
  tomlMissingQuoteServer,
  tomlSingleQuoted
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";
import { handlers, tomlHandler, tomlMissingHandler } from "@/features/sep38-quote-viewer/msw/handlers";
import {
  normalizeQuoteServer,
  readAnchorQuoteServer,
  resolveQuoteServer,
  tomlUrlFor
} from "@/features/sep38-quote-viewer/lib/quote-server-resolve";

const server = withMswHandlers(...handlers);

describe("readAnchorQuoteServer", () => {
  it("reads quoted, single-quoted, and bare values", () => {
    expect(readAnchorQuoteServer(tomlDocument)).toEqual({ ok: true, value: QUOTE_SERVER });
    expect(readAnchorQuoteServer(tomlSingleQuoted)).toEqual({ ok: true, value: QUOTE_SERVER });
    expect(readAnchorQuoteServer(tomlBare)).toEqual({ ok: true, value: QUOTE_SERVER });
  });

  it("ignores a commented key and rejects plaintext or broken URLs", () => {
    expect(readAnchorQuoteServer(tomlCommentedOnly)).toEqual({ ok: false, code: "missing_quote_server" });
    expect(readAnchorQuoteServer(tomlMissingQuoteServer)).toEqual({ ok: false, code: "missing_quote_server" });
    expect(readAnchorQuoteServer(tomlHttpQuoteServer)).toEqual({ ok: false, code: "request_failed" });
    expect(readAnchorQuoteServer(tomlBrokenQuoteServer)).toEqual({ ok: false, code: "request_failed" });
    expect(normalizeQuoteServer(`${QUOTE_SERVER}/`)).toEqual({ ok: true, value: QUOTE_SERVER });
  });
});

describe("resolveQuoteServer", () => {
  it("builds the well-known toml URL and returns the published server", async () => {
    expect(tomlUrlFor("quote.example")).toBe(TOML_URL);
    const result = await resolveQuoteServer("quote.example");
    expect(result).toEqual({
      ok: true,
      value: { homeDomain: "quote.example", tomlUrl: TOML_URL, quoteServer: QUOTE_SERVER }
    });
  });

  it("does not fetch when the home domain is invalid", async () => {
    let calls = 0;
    const result = await resolveQuoteServer("http://quote.example", {
      fetchImpl: async () => {
        calls += 1;
        return new Response(tomlDocument);
      }
    });
    expect(calls).toBe(0);
    expect(result).toEqual({ ok: false, code: "invalid_home_domain" });
  });

  it("reports a missing quote server and a missing toml as different failures", async () => {
    server.use(tomlHandler(tomlMissingQuoteServer));
    expect(await resolveQuoteServer("quote.example")).toEqual({ ok: false, code: "missing_quote_server" });

    server.use(tomlMissingHandler);
    expect(await resolveQuoteServer("quote.example")).toEqual({ ok: false, code: "request_failed" });

    server.use(http.get(TOML_URL, () => HttpResponse.error()));
    expect(await resolveQuoteServer("quote.example")).toEqual({ ok: false, code: "request_failed" });
  });
});
