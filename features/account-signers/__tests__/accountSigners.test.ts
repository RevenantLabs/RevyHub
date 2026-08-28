import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import {
  assessThresholds,
  isNormalSingleSignerAccount,
  loadAccountSigners,
  normalizeSigner,
  totalSignerWeight
} from "@/features/account-signers/lib/accountSigners";
import { toAccountSignersErrorCode } from "@/features/account-signers/lib/accountSigners.errors";
import {
  handlers,
  rateLimitedHandler,
  serverErrorHandler,
  transportFailureHandler
} from "@/features/account-signers/msw/handlers";
import {
  accountId,
  normalAccountId,
  unknownAccountId
} from "@/features/account-signers/fixtures/accountSigners.fixture";
import type { AccountSigner, SignerType } from "@/features/account-signers/types";

const server = withMswHandlers(...handlers);

describe("signer analysis", () => {
  it.each<SignerType>([
    "ed25519_public_key",
    "sha256_hash",
    "preauth_tx",
    "ed25519_signed_payload"
  ])("preserves the %s signer type and weight", (type) => {
    expect(normalizeSigner({ key: accountId, weight: 7, type }, accountId)).toMatchObject({
      key: accountId,
      weight: "7",
      type
    });
  });

  it("labels only the account's ed25519 key as the master signer", () => {
    expect(
      normalizeSigner({ key: accountId, weight: 0, type: "ed25519_public_key" }, accountId)
        .isMaster
    ).toBe(true);
    expect(
      normalizeSigner({ key: accountId, weight: 1, type: "sha256_hash" }, accountId).isMaster
    ).toBe(false);
  });

  it("totals weights with BigInt precision", () => {
    expect(
      totalSignerWeight([
        { weight: "9007199254740993" },
        { weight: "9" }
      ])
    ).toBe("9007199254741002");
  });

  it("flags only thresholds above the total available weight", () => {
    expect(assessThresholds({ low: "1", medium: "10", high: "11" }, "10")).toEqual([
      { level: "low", requiredWeight: "1", availableWeight: "10", canBeMet: true },
      { level: "medium", requiredWeight: "10", availableWeight: "10", canBeMet: true },
      { level: "high", requiredWeight: "11", availableWeight: "10", canBeMet: false }
    ]);
  });

  it("recognizes the default single-master-signer setup", () => {
    const signer: AccountSigner = {
      key: accountId,
      weight: "1",
      type: "ed25519_public_key",
      isMaster: true
    };

    expect(isNormalSingleSignerAccount([signer], { low: "0", medium: "0", high: "0" })).toBe(
      true
    );
    expect(isNormalSingleSignerAccount([signer], { low: "1", medium: "0", high: "0" })).toBe(
      false
    );
  });

  it("maps timeout failures to the request_failed fallback", () => {
    expect(toAccountSignersErrorCode(new Error("request timeout"))).toBe("request_failed");
  });
});

describe("loadAccountSigners", () => {
  it("returns every signer, total weight, and threshold assessment", async () => {
    resetHorizonClients();
    const result = await loadAccountSigners({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.signers).toHaveLength(5);
    expect(new Set(result.value.signers.map((signer) => signer.type))).toEqual(
      new Set([
        "ed25519_public_key",
        "sha256_hash",
        "preauth_tx",
        "ed25519_signed_payload"
      ])
    );
    expect(result.value.totalWeight).toBe("10");
    expect(result.value.masterKeyDisabled).toBe(true);
    expect(result.value.isMultisig).toBe(true);
    expect(result.value.thresholdAssessments.at(-1)?.canBeMet).toBe(false);
  });

  it("classifies the default account as normal and non-multisig", async () => {
    resetHorizonClients();
    const result = await loadAccountSigners({ accountId: normalAccountId }, "testnet");
    expect(result.ok && result.value.isNormalSingleSigner).toBe(true);
    expect(result.ok && result.value.isMultisig).toBe(false);
  });

  it("maps a 404 to account_not_found", async () => {
    resetHorizonClients();
    const result = await loadAccountSigners({ accountId: unknownAccountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const result = await loadAccountSigners({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps a Horizon 5xx to request_failed", async () => {
    server.use(serverErrorHandler);
    resetHorizonClients();
    const result = await loadAccountSigners({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });

  it("maps a transport failure to request_failed", async () => {
    server.use(transportFailureHandler);
    resetHorizonClients();
    const result = await loadAccountSigners({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});
