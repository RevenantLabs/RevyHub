import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import {
  decodeDataEntries,
  decodeDataValue,
  loadAccountDataEntries
} from "@/features/account-data-entries/lib/accountDataEntries";
import {
  handlers,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/account-data-entries/msw/handlers";
import {
  accountId,
  binaryBase64,
  invalidBase64,
  textBase64,
  textValue,
  unknownAccountId
} from "@/features/account-data-entries/fixtures/accountDataEntries.fixture";

const server = withMswHandlers(...handlers);

describe("decodeDataValue", () => {
  it("recognises printable UTF-8 text", () => {
    expect(decodeDataValue(textBase64)).toEqual({
      kind: "text",
      text: textValue,
      byteLength: 15
    });
  });

  it("renders non-UTF-8 and control bytes as hex", () => {
    expect(decodeDataValue(binaryBase64)).toEqual({
      kind: "bytes",
      hex: "00ff107f",
      byteLength: 4
    });
    expect(decodeDataValue(btoa("line\n"))).toMatchObject({ kind: "bytes" });
  });

  it("reports malformed and non-canonical base64 without throwing", () => {
    expect(decodeDataValue(invalidBase64)).toEqual({ kind: "invalid_base64" });
    expect(decodeDataValue("AB==")).toEqual({ kind: "invalid_base64" });
  });
});

describe("decodeDataEntries", () => {
  it("sorts keys and isolates a malformed row", () => {
    const entries = decodeDataEntries({ z: textBase64, broken: invalidBase64 });
    expect(entries.map((entry) => entry.key)).toEqual(["broken", "z"]);
    expect(entries[0].decoded).toEqual({ kind: "invalid_base64" });
    expect(entries[1].decoded).toMatchObject({ kind: "text", text: textValue });
  });
});

describe("loadAccountDataEntries", () => {
  it("returns all decoded rows for an existing account", async () => {
    resetHorizonClients();
    const result = await loadAccountDataEntries({ accountId }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.accountId).toBe(accountId);
    expect(result.value.entries).toHaveLength(3);
    expect(result.value.entries.find((entry) => entry.key === "broken")?.decoded).toEqual({
      kind: "invalid_base64"
    });
  });

  it("maps a 404 to account_not_found", async () => {
    resetHorizonClients();
    await expect(loadAccountDataEntries({ accountId: unknownAccountId }, "testnet")).resolves.toEqual({
      ok: false,
      code: "account_not_found"
    });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    await expect(loadAccountDataEntries({ accountId }, "testnet")).resolves.toEqual({
      ok: false,
      code: "rate_limited"
    });
  });

  it("maps a server failure to request_failed", async () => {
    server.use(serverErrorHandler);
    resetHorizonClients();
    await expect(loadAccountDataEntries({ accountId }, "testnet")).resolves.toEqual({
      ok: false,
      code: "request_failed"
    });
  });
});
