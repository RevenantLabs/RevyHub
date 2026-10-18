import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  analyzeMergePreflight,
  checkAccountMergePreflight,
  HorizonResponseError
} from "@/features/account-merge-preflight/lib/accountMergePreflight";
import { toAccountMergePreflightErrorCode } from "@/features/account-merge-preflight/lib/accountMergePreflight.errors";
import {
  blockedSourceHandler,
  capacityLimitedDestinationHandler,
  handlers,
  offersHandler,
  offersUnavailableHandler,
  paginatedOffersHandler,
  sourceUnavailableHandler
} from "@/features/account-merge-preflight/msw/handlers";
import {
  blockedSourceAccount,
  capacityLimitedDestination,
  destinationAccount,
  destinationAccountId,
  mergeableSourceAccount,
  offers,
  sourceAccountId,
  unknownDestinationAccountId,
  unknownSourceAccountId
} from "@/features/account-merge-preflight/fixtures/accountMergePreflight.fixture";

const server = withMswHandlers(...handlers);
const valid = { sourceAccountId, destinationAccountId };

describe("analyzeMergePreflight", () => {
  it("reports a clean source as mergeable with the exact XLM transfer", () => {
    const result = analyzeMergePreflight(mergeableSourceAccount, destinationAccount, []);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.mergeable).toBe(true);
    expect(result.value.transferableXlm).toBe("25.5000000");
    expect(result.value.blockers).toEqual([]);
    expect(result.value.checks).toHaveLength(8);
    expect(result.value.checks.every((check) => check.passed)).toBe(true);
  });

  it("lists every blocker with its concrete identity", () => {
    const result = analyzeMergePreflight(blockedSourceAccount, destinationAccount, offers);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.mergeable).toBe(false);
    expect(result.value.blockers).toHaveLength(9);
    expect(result.value.blockers).toContainEqual(
      expect.objectContaining({ kind: "trustline", asset: expect.stringContaining("USD:") })
    );
    expect(result.value.blockers).toContainEqual(
      expect.objectContaining({ kind: "offer", id: "101", selling: "XLM" })
    );
    expect(result.value.blockers).toContainEqual({ kind: "data_entry", name: "invoice" });
    expect(result.value.blockers).toContainEqual({ kind: "sponsorship", count: 2n });
    expect(result.value.blockers).toContainEqual({
      kind: "signer_weight",
      configured: 5n,
      required: 10n
    });
    expect(result.value.blockers).toContainEqual({ kind: "immutable_auth" });
  });

  it("does not treat additional or sponsored signers as merge blockers", () => {
    const source = {
      ...mergeableSourceAccount,
      thresholds: { high_threshold: 3 },
      signers: [
        { key: sourceAccountId, weight: 1 },
        { key: "additional-signer", weight: 2 }
      ],
      num_sponsored: 4
    };
    const result = analyzeMergePreflight(source, destinationAccount, []);
    expect(result.ok && result.value.mergeable).toBe(true);
    expect(result.ok && result.value.sponsoredSubentryCount).toBe(4n);
  });

  it("detects destination overflow after native buying liabilities", () => {
    const result = analyzeMergePreflight(
      mergeableSourceAccount,
      capacityLimitedDestination,
      []
    );
    expect(result.ok && result.value.mergeable).toBe(false);
    expect(result.ok && result.value.blockers).toContainEqual({
      kind: "destination_capacity",
      transferableXlm: "25.5000000",
      maximumReceivableXlm: "5.4775807"
    });
  });

  it("returns request_failed instead of throwing for malformed Horizon amounts", () => {
    expect(
      analyzeMergePreflight(
        { ...mergeableSourceAccount, balances: [{ asset_type: "native", balance: "NaN" }] },
        destinationAccount,
        []
      )
    ).toEqual({ ok: false, code: "request_failed" });

    expect(
      analyzeMergePreflight(
        {
          ...mergeableSourceAccount,
          balances: [{ asset_type: "native", balance: "922337203685.4775808" }]
        },
        destinationAccount,
        []
      )
    ).toEqual({ ok: false, code: "request_failed" });
  });
});

describe("checkAccountMergePreflight", () => {
  it("rejects self-merge before loading Horizon", async () => {
    expect(
      await checkAccountMergePreflight(
        { sourceAccountId, destinationAccountId: sourceAccountId },
        "testnet"
      )
    ).toEqual({ ok: false, code: "same_account" });
  });

  it("loads both accounts and all offers", async () => {
    expect(await checkAccountMergePreflight(valid, "testnet")).toMatchObject({
      ok: true,
      value: { mergeable: true, transferableXlm: "25.5000000" }
    });
  });

  it("returns source_not_found for the source account only", async () => {
    expect(
      await checkAccountMergePreflight(
        { sourceAccountId: unknownSourceAccountId, destinationAccountId },
        "testnet"
      )
    ).toEqual({ ok: false, code: "source_not_found" });
  });

  it("returns destination_not_found after finding the source", async () => {
    expect(
      await checkAccountMergePreflight(
        { sourceAccountId, destinationAccountId: unknownDestinationAccountId },
        "testnet"
      )
    ).toEqual({ ok: false, code: "destination_not_found" });
  });

  it("returns request_failed for account and offer 5xx responses", async () => {
    server.use(sourceUnavailableHandler);
    expect(await checkAccountMergePreflight(valid, "testnet")).toEqual({
      ok: false,
      code: "request_failed"
    });

    server.resetHandlers(...handlers);
    server.use(offersUnavailableHandler);
    expect(await checkAccountMergePreflight(valid, "testnet")).toEqual({
      ok: false,
      code: "request_failed"
    });
  });

  it("follows offer pagination until the final short page", async () => {
    server.use(paginatedOffersHandler);
    const result = await checkAccountMergePreflight(valid, "testnet");
    expect(result.ok && result.value.blockers).toHaveLength(201);
    expect(
      result.ok && result.value.checks.find((check) => check.id === "offers")?.blockerCount
    ).toBe(201);
  });

  it("renders all domain blockers received from the network", async () => {
    server.use(blockedSourceHandler, offersHandler, capacityLimitedDestinationHandler);
    const result = await checkAccountMergePreflight(valid, "testnet");
    expect(result.ok && result.value.blockers.map((blocker) => blocker.kind)).toEqual(
      expect.arrayContaining([
        "trustline",
        "offer",
        "data_entry",
        "sponsorship",
        "signer_weight",
        "immutable_auth",
        "destination_capacity"
      ])
    );
  });
});

describe("toAccountMergePreflightErrorCode", () => {
  it("keeps source and destination 404 errors distinct", () => {
    const missing = new HorizonResponseError(404);
    expect(toAccountMergePreflightErrorCode(missing, "source_not_found")).toBe(
      "source_not_found"
    );
    expect(toAccountMergePreflightErrorCode(missing, "destination_not_found")).toBe(
      "destination_not_found"
    );
  });

  it.each([new HorizonResponseError(500), new Error("timeout"), new Error("network failed")])(
    "maps every non-404 transport failure to request_failed",
    (failure) => {
      expect(toAccountMergePreflightErrorCode(failure, "source_not_found")).toBe(
        "request_failed"
      );
    }
  );
});
