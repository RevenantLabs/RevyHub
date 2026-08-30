import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import {
  normalizeAccountDataEntries,
  runAccountDataEntries
} from "@/features/account-data-entries/lib/accountDataEntries";
import {
  decodeAccountDataValue,
  formatDecodedAccountDataValue
} from "@/features/account-data-entries/lib/format";
import {
  handlers,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/account-data-entries/msw/handlers";
import {
  accountId,
  accountResponse,
  binaryBase64,
  binaryEntryKey,
  brokenBase64,
  brokenEntryKey,
  emptyAccountId,
  textBase64,
  textEntryKey,
  unknownAccountId
} from "@/features/account-data-entries/fixtures/accountDataEntries.fixture";

const server = withMswHandlers(...handlers);

describe("normalizeAccountDataEntries", () => {
  it("sorts rows by key and decodes each value", () => {
    const entries = normalizeAccountDataEntries(accountResponse.data);

    expect(entries.map((entry) => entry.key)).toEqual([
      brokenEntryKey,
      textEntryKey,
      binaryEntryKey
    ]);
    expect(entries[0].value).toEqual({ kind: "invalid_base64" });
    expect(entries[1].value).toEqual({ kind: "text", text: "verified", byteLength: 8 });
    expect(entries[2].value).toEqual({ kind: "bytes", hex: "00ff10", byteLength: 3 });
  });
});

describe("runAccountDataEntries", () => {
  it("returns decoded entries for a funded account", async () => {
    resetHorizonClients();
    const result = await runAccountDataEntries({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.accountId).toBe(accountId);
    expect(result.value.entries).toHaveLength(3);
    expect(result.value.entries[0].value).toEqual({ kind: "invalid_base64" });
    expect(result.value.entries[1].value).toEqual({ kind: "text", text: "verified", byteLength: 8 });
    expect(result.value.entries[2].value).toEqual({ kind: "bytes", hex: "00ff10", byteLength: 3 });
    expect(formatDecodedAccountDataValue(result.value.entries[1].value)).toBe("verified");
    expect(decodeAccountDataValue(textBase64)).toEqual({ kind: "text", text: "verified", byteLength: 8 });
    expect(decodeAccountDataValue(binaryBase64)).toEqual({ kind: "bytes", hex: "00ff10", byteLength: 3 });
    expect(decodeAccountDataValue(brokenBase64)).toEqual({ kind: "invalid_base64" });
  });

  it("returns an empty result for an account with no data entries", async () => {
    resetHorizonClients();
    const result = await runAccountDataEntries({ accountId: emptyAccountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entries).toHaveLength(0);
  });

  it("maps a 404 to account_not_found", async () => {
    resetHorizonClients();
    const result = await runAccountDataEntries({ accountId: unknownAccountId }, "testnet");

    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();

    const result = await runAccountDataEntries({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps a 500 to request_failed", async () => {
    server.use(serverErrorHandler);
    resetHorizonClients();

    const result = await runAccountDataEntries({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});
