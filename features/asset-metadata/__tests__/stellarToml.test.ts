import { describe, expect, it } from "vitest";
import { HttpResponse, http, withMswHandlers } from "@/core/testing/msw";
import { fetchStellarToml } from "@/features/asset-metadata/lib/stellarToml";
import {
  handlers,
  notFoundHandler,
  oversizedHeaderHandler,
  serverErrorHandler,
  tomlHandler
} from "@/features/asset-metadata/msw/handlers";
import {
  ORIGIN,
  TOML_URL,
  issuerA,
  malformedToml,
  tomlWithoutCurrencies
} from "@/features/asset-metadata/fixtures/assetMetadata.fixture";

const server = withMswHandlers(...handlers);
const input = { origin: ORIGIN };

describe("fetchStellarToml", () => {
  it("fetches the well-known path and parses the currencies", async () => {
    const result = await fetchStellarToml(input);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.fetchUrl).toBe(TOML_URL);
    expect(result.value.currencies).toHaveLength(2);
    expect(result.value.currencies[0]).toMatchObject({ code: "USDC", issuer: issuerA });
  });

  it("records when the file was read", async () => {
    const result = await fetchStellarToml(input);
    expect(result.ok && Date.parse(result.value.fetchedAt)).toBeGreaterThan(0);
  });

  it("treats a toml with no currencies as a success, not an error", async () => {
    server.use(tomlHandler(tomlWithoutCurrencies));
    const result = await fetchStellarToml(input);

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.currencies).toEqual([]);
  });

  it("reports a domain that publishes no toml", async () => {
    server.use(notFoundHandler);
    expect(await fetchStellarToml(input)).toEqual({ ok: false, code: "toml_not_found" });
  });

  it("separates a server error from a missing file", async () => {
    server.use(serverErrorHandler);
    expect(await fetchStellarToml(input)).toEqual({ ok: false, code: "server_error" });
  });

  it("refuses a response that declares an oversized body", async () => {
    server.use(oversizedHeaderHandler);
    expect(await fetchStellarToml(input)).toEqual({ ok: false, code: "response_too_large" });
  });

  it("refuses a body that exceeds the cap even without a content-length", async () => {
    server.use(tomlHandler("x".repeat(200 * 1024)));
    expect(await fetchStellarToml(input)).toEqual({ ok: false, code: "response_too_large" });
  });

  it("reports a toml whose CURRENCIES section is malformed", async () => {
    server.use(tomlHandler(malformedToml));
    expect(await fetchStellarToml(input)).toEqual({ ok: false, code: "toml_malformed" });
  });

  it("reports an unreachable domain", async () => {
    // HttpResponse.error() simulates a transport failure — the same opaque
    // TypeError a browser produces for DNS failure and for a CORS refusal.
    server.use(http.get(TOML_URL, () => HttpResponse.error()));

    expect(await fetchStellarToml(input)).toEqual({ ok: false, code: "network_error" });
  });
});
