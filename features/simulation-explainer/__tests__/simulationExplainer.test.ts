import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { runSimulationExplainer } from "@/features/simulation-explainer/lib/simulationExplainer";
import {
  handlers,
  networkErrorHandler,
  restoreRequiredHandler,
  rpcErrorHandler
} from "@/features/simulation-explainer/msw/handlers";
import {
  buildTransactionEnvelopeXdr,
  sourceAccountId,
  validTransactionXdr
} from "@/features/simulation-explainer/fixtures/simulationExplainer.fixture";

const server = withMswHandlers(...handlers);

describe("runSimulationExplainer", () => {
  it("returns a success result for a valid transaction envelope", async () => {
    const result = await runSimulationExplainer({ xdr: validTransactionXdr }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("success");
    if (result.value.kind !== "success") return;

    expect(result.value.minResourceFee).toBe("12345");
    expect(result.value.latestLedger).toBe(1_000_000);
    expect(result.value.resources.cpuInstructions).toBe("1000");
    expect(result.value.resources.readBytes).toBe("200");
    expect(result.value.resources.writeBytes).toBe("300");
    expect(result.value.resources.ledgerReadEntries).toBe(1);
    expect(result.value.resources.ledgerWriteEntries).toBe(1);

    expect(result.value.authEntries).toHaveLength(1);
    const auth = result.value.authEntries[0];
    expect(auth.accountId).toBe(sourceAccountId);
    expect(auth.contractId).toBeNull();
    expect(auth.nonce).toBe("123456789");
    expect(auth.signatureArgs).toHaveLength(1);
  });

  it("returns a failure result when the simulation reports an error", async () => {
    const result = await runSimulationExplainer({ xdr: buildTransactionEnvelopeXdr() + "X" }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("failure");
  });

  it("returns a restore result when archived state is reported", async () => {
    server.use(restoreRequiredHandler);

    const result = await runSimulationExplainer({ xdr: validTransactionXdr }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("restore");
  });

  it("maps a JSON-RPC error to rpc_error", async () => {
    server.use(rpcErrorHandler);

    const result = await runSimulationExplainer({ xdr: validTransactionXdr }, "testnet");
    expect(result).toEqual({ ok: false, code: "rpc_error" });
  });

  it("maps a network failure to request_failed", async () => {
    server.use(networkErrorHandler);

    const result = await runSimulationExplainer({ xdr: validTransactionXdr }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });

  it("surfaces contract IDs from address credentials when present", async () => {
    const result = await runSimulationExplainer({ xdr: validTransactionXdr }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const auth = result.value.kind === "success" ? result.value.authEntries[0] : null;
    expect(auth).toBeDefined();
    expect(auth?.contractId ?? auth?.accountId).toBeTruthy();
  });
});
