import { describe, expect, it } from "vitest";
import { HttpResponse, http, withMswHandlers } from "@/core/testing/msw";
import {
  discoverFederationServer,
  queryFederationServer,
  resolveFederation,
  tomlUrlFor
} from "@/features/federation-resolver/lib/federation";
import {
  federationHandler,
  handlers,
  tomlHandler,
  tomlMissingHandler
} from "@/features/federation-resolver/msw/handlers";
import {
  DOMAIN,
  FEDERATION_SERVER,
  recordWithBadAccount,
  recordWithMemo,
  recordWithMemoButNoType,
  recordWithOverlongTextMemo,
  recordWithUnsupportedMemoType,
  recordWithoutMemo,
  resolvedAccountId,
  tomlWithBareValue,
  tomlWithBrokenFederation,
  tomlWithHttpFederation,
  tomlWithSingleQuotes,
  tomlWithoutFederation
} from "@/features/federation-resolver/fixtures/federationResolver.fixture";

const server = withMswHandlers(...handlers);
const alice = { name: "alice", domain: DOMAIN };

describe("tomlUrlFor", () => {
  it("always uses the well-known HTTPS path", () => {
    expect(tomlUrlFor("example.com")).toBe("https://example.com/.well-known/stellar.toml");
  });
});

describe("discoverFederationServer", () => {
  it("reads FEDERATION_SERVER out of the toml", async () => {
    const result = await discoverFederationServer(DOMAIN, {});
    expect(result).toEqual({ ok: true, value: FEDERATION_SERVER });
  });

  it("accepts single-quoted and bare TOML values", async () => {
    server.use(tomlHandler(tomlWithSingleQuotes));
    expect(await discoverFederationServer(DOMAIN, {})).toEqual({ ok: true, value: FEDERATION_SERVER });

    server.use(tomlHandler(tomlWithBareValue));
    expect(await discoverFederationServer(DOMAIN, {})).toEqual({ ok: true, value: FEDERATION_SERVER });
  });

  it("reports a domain with no toml", async () => {
    server.use(tomlMissingHandler);
    expect(await discoverFederationServer(DOMAIN, {})).toEqual({ ok: false, code: "toml_not_found" });
  });

  it("reports a toml that declares no federation server", async () => {
    server.use(tomlHandler(tomlWithoutFederation));
    expect(await discoverFederationServer(DOMAIN, {})).toEqual({
      ok: false,
      code: "no_federation_server"
    });
  });

  it("refuses a plaintext federation server", async () => {
    server.use(tomlHandler(tomlWithHttpFederation));
    expect(await discoverFederationServer(DOMAIN, {})).toEqual({ ok: false, code: "https_required" });
  });

  it("reports a FEDERATION_SERVER that is not a URL", async () => {
    server.use(tomlHandler(tomlWithBrokenFederation));
    expect(await discoverFederationServer(DOMAIN, {})).toEqual({ ok: false, code: "toml_malformed" });
  });
});

describe("queryFederationServer", () => {
  it("returns the account and memo", async () => {
    const result = await queryFederationServer(FEDERATION_SERVER, alice, {});

    expect(result).toEqual({
      ok: true,
      value: { accountId: resolvedAccountId, memoType: "id", memo: "12345" }
    });
  });

  it("returns a record with no memo", async () => {
    server.use(federationHandler(recordWithoutMemo));
    const result = await queryFederationServer(FEDERATION_SERVER, alice, {});

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.memo).toBeUndefined();
  });

  it("reports a name the server does not know", async () => {
    server.use(federationHandler(null, 404));
    expect(await queryFederationServer(FEDERATION_SERVER, alice, {})).toEqual({
      ok: false,
      code: "name_not_found"
    });
  });

  it("reports a server error separately from a missing name", async () => {
    server.use(federationHandler(null, 500));
    expect(await queryFederationServer(FEDERATION_SERVER, alice, {})).toEqual({
      ok: false,
      code: "federation_server_error"
    });
  });

  it("rejects an account_id that is not a valid public key", async () => {
    server.use(federationHandler(recordWithBadAccount));
    expect(await queryFederationServer(FEDERATION_SERVER, alice, {})).toEqual({
      ok: false,
      code: "invalid_account_id"
    });
  });

  it("rejects a memo without a memo_type", async () => {
    server.use(federationHandler(recordWithMemoButNoType));
    expect(await queryFederationServer(FEDERATION_SERVER, alice, {})).toEqual({
      ok: false,
      code: "invalid_memo"
    });
  });

  it("rejects an unsupported memo_type", async () => {
    server.use(federationHandler(recordWithUnsupportedMemoType));
    expect(await queryFederationServer(FEDERATION_SERVER, alice, {})).toEqual({
      ok: false,
      code: "invalid_memo"
    });
  });

  it("measures a text memo in bytes, not characters", async () => {
    server.use(federationHandler(recordWithOverlongTextMemo));
    expect(recordWithOverlongTextMemo.memo.length).toBeLessThan(28);

    expect(await queryFederationServer(FEDERATION_SERVER, alice, {})).toEqual({
      ok: false,
      code: "invalid_memo"
    });
  });

  it("sends the canonical name*domain query the protocol requires", async () => {
    let requested: URL | null = null;
    server.use(
      http.get(FEDERATION_SERVER, ({ request }) => {
        requested = new URL(request.url);
        return HttpResponse.json(recordWithMemo);
      })
    );

    await queryFederationServer(FEDERATION_SERVER, alice, {});

    expect(requested).not.toBeNull();
    expect(requested!.searchParams.get("q")).toBe(`alice*${DOMAIN}`);
    expect(requested!.searchParams.get("type")).toBe("name");
  });
});

describe("resolveFederation", () => {
  it("resolves end to end and reports its provenance", async () => {
    const result = await resolveFederation(alice, {});

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.record.accountId).toBe(resolvedAccountId);
    expect(result.value.federationServer).toBe(FEDERATION_SERVER);
    expect(result.value.tomlUrl).toBe(tomlUrlFor(DOMAIN));
  });

  it("stops at the toml step when there is no federation server", async () => {
    server.use(tomlHandler(tomlWithoutFederation));
    expect(await resolveFederation(alice, {})).toEqual({
      ok: false,
      code: "no_federation_server"
    });
  });

  it("reports a cancelled lookup as a timeout", async () => {
    const controller = new AbortController();
    controller.abort();

    expect(await resolveFederation(alice, { signal: controller.signal })).toEqual({
      ok: false,
      code: "timeout"
    });
  });
});
