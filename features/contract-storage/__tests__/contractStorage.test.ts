import { describe, expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { withMswHandlers } from "@/core/testing/msw";
import {
  buildContractInstanceLedgerKey,
  formatScVal,
  runContractStorage
} from "@/features/contract-storage/lib/contractStorage";
import {
  handlers,
  networkErrorHandler,
  rpcErrorHandler
} from "@/features/contract-storage/msw/handlers";
import {
  contractId,
  latestLedger,
  liveUntilLedgerSeq,
  unknownContractId
} from "@/features/contract-storage/fixtures/contractStorage.fixture";

const server = withMswHandlers(...handlers);

describe("buildContractInstanceLedgerKey", () => {
  it("returns a base64-encoded ledger key for a valid contract ID", () => {
    const key = buildContractInstanceLedgerKey(contractId);
    expect(typeof key).toBe("string");
    expect(key.length).toBeGreaterThan(0);
  });
});

describe("formatScVal", () => {
  it("formats symbols, strings and numbers", () => {
    expect(formatScVal(xdr.ScVal.scvSymbol("counter"))).toBe("counter");
    expect(formatScVal(xdr.ScVal.scvString("hello"))).toBe("hello");
    expect(formatScVal(xdr.ScVal.scvU32(42))).toBe("42");
    expect(formatScVal(xdr.ScVal.scvBool(true))).toBe("true");
  });

  it("formats vectors and maps", () => {
    expect(formatScVal(xdr.ScVal.scvVec([xdr.ScVal.scvU32(1), xdr.ScVal.scvU32(2)]))).toBe("[1, 2]");

    const mapEntry = new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("k"),
      val: xdr.ScVal.scvU32(1)
    });
    expect(formatScVal(xdr.ScVal.scvMap([mapEntry]))).toBe("{k: 1}");
  });
});

describe("runContractStorage", () => {
  it("returns instance storage entries with TTLs for a valid contract", async () => {
    const result = await runContractStorage({ contractId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.contractId).toBe(contractId);
    expect(result.value.latestLedger).toBe(latestLedger);
    expect(result.value.entries).toHaveLength(2);

    const counter = result.value.entries.find((entry) => entry.key === "counter");
    expect(counter).toBeDefined();
    expect(counter?.value).toBe("42");
    expect(counter?.kind).toBe("instance");
    expect(counter?.liveUntilLedger).toBe(liveUntilLedgerSeq);
    expect(counter?.ledgersRemaining).toBe(liveUntilLedgerSeq - latestLedger);
  });

  it("maps an empty ledger entries response to contract_not_found", async () => {
    const result = await runContractStorage({ contractId: unknownContractId }, "testnet");
    expect(result).toEqual({ ok: false, code: "contract_not_found" });
  });

  it("maps a JSON-RPC error to rpc_error", async () => {
    server.use(rpcErrorHandler);

    const result = await runContractStorage({ contractId }, "testnet");
    expect(result).toEqual({ ok: false, code: "rpc_error" });
  });

  it("maps a network failure to request_failed", async () => {
    server.use(networkErrorHandler);

    const result = await runContractStorage({ contractId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});
