import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import { runMultisigAnalyzer } from "@/features/multisig-analyzer/lib/multisigAnalyzer";
import { handlers } from "@/features/multisig-analyzer/msw/handlers";
import {
  altSourceAccountId,
  buildTestEnvelope,
  sourceAccountId,
  sourceAccountResponse,
  transactionSourceAccountId
} from "@/features/multisig-analyzer/fixtures/multisigAnalyzer.fixture";

const server = withMswHandlers(...handlers);

describe("runMultisigAnalyzer", () => {
  it("accepts a valid transaction envelope and returns the shortfall against the source account", async () => {
    resetHorizonClients();
    const envelope = buildTestEnvelope({
      sourceAccountId: transactionSourceAccountId,
      signers: [sourceAccountResponse.signers[0], sourceAccountResponse.signers[2]]
    });

    const result = await runMultisigAnalyzer(
      { envelope, sourceAccount: sourceAccountId },
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.requiredThreshold).toBe("medium");
    expect(result.value.shortfallWeight).toBe("0");
    expect(result.value.signatureWeight).toBe("3");
    expect(result.value.missingSigners.map((signer) => signer.key)).toContain(
      sourceAccountResponse.signers[1].key
    );
  });

  it("evaluates an operation with its own source account against that account instead of the tx source", async () => {
    resetHorizonClients();
    const envelope = buildTestEnvelope({
      sourceAccountId: transactionSourceAccountId,
      signers: [sourceAccountResponse.signers[0]],
      operationSourceAccountId: altSourceAccountId,
      operationSourceSigners: [
        { key: altSourceAccountId, weight: "1", type: "ed25519_public_key" },
        { key: "G" + "A".repeat(55), weight: "4", type: "ed25519_public_key" }
      ]
    });

    const result = await runMultisigAnalyzer(
      { envelope, sourceAccount: sourceAccountId },
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.operations[0]?.sourceAccount).toBe(altSourceAccountId);
    expect(result.value.operations[0]?.requiredThreshold).toBe("medium");
  });

  it("maps Horizon account-not-found responses to the correct error code", async () => {
    resetHorizonClients();
    const result = await runMultisigAnalyzer(
      { envelope: buildTestEnvelope({ sourceAccountId: transactionSourceAccountId }), sourceAccount: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });
});
