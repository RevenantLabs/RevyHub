import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  parseHorizonFlags,
  runAssetFlagsInspector
} from "@/features/asset-flags-inspector/lib/assetFlagsInspector";
import {
  handlers,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/asset-flags-inspector/msw/handlers";
import {
  immutableFlags,
  immutableIssuerId,
  issuerId,
  noFlags,
  restrictedFlags,
  restrictedIssuerId,
  unknownIssuerId
} from "@/features/asset-flags-inspector/fixtures/assetFlagsInspector.fixture";

const server = withMswHandlers(...handlers);

describe("parseHorizonFlags", () => {
  it("maps Horizon snake_case flags to the internal shape", () => {
    expect(
      parseHorizonFlags({
        auth_required: true,
        auth_revocable: false,
        auth_clawback_enabled: true,
        auth_immutable: false
      })
    ).toEqual({
      authRequired: true,
      authRevocable: false,
      authClawbackEnabled: true,
      authImmutable: false
    });
  });

  it("treats missing values as disabled", () => {
    expect(parseHorizonFlags({})).toEqual(noFlags);
  });
});

describe("runAssetFlagsInspector", () => {
  it("returns flags and plain-language context for an ordinary issuer", async () => {
    resetHorizonClients();
    const result = await runAssetFlagsInspector({ issuerId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.flags).toEqual(noFlags);
    expect(result.value.summary).toMatch(/no special authorization flags/i);
    expect(result.value.callouts[0]).toMatch(/assets this account issues/i);
  });

  it("calls out full issuer control when required and revocable are both set", async () => {
    resetHorizonClients();
    const result = await runAssetFlagsInspector({ issuerId: restrictedIssuerId }, "testnet");

    expect(result.ok && result.value.flags).toEqual(restrictedFlags);
    if (!result.ok) return;
    expect(result.value.callouts.join(" ")).toMatch(/full control/i);
  });

  it("highlights immutable authorization in the summary callouts", async () => {
    resetHorizonClients();
    const result = await runAssetFlagsInspector({ issuerId: immutableIssuerId }, "testnet");

    expect(result.ok && result.value.flags).toEqual(immutableFlags);
    if (!result.ok) return;
    expect(result.value.callouts.join(" ")).toMatch(/cannot be changed later/i);
  });

  it("maps a 404 to account_not_found", async () => {
    resetHorizonClients();
    const result = await runAssetFlagsInspector({ issuerId: unknownIssuerId }, "testnet");
    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const result = await runAssetFlagsInspector({ issuerId }, "testnet");
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps a 500 to request_failed", async () => {
    server.use(serverErrorHandler);
    resetHorizonClients();
    const result = await runAssetFlagsInspector({ issuerId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});
