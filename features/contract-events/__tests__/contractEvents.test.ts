import { describe, expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { withMswHandlers } from "@/core/testing/msw";
import {
  decodeScVal,
  isKnownEventType,
  runContractEvents
} from "@/features/contract-events/lib/contractEvents";
import {
  handlers,
  networkErrorHandler,
  rpcErrorHandler
} from "@/features/contract-events/msw/handlers";
import {
  contractId,
  encodeScVal,
  endLedger,
  latestLedger,
  startLedger,
  unknownContractId
} from "@/features/contract-events/fixtures/contractEvents.fixture";

const server = withMswHandlers(...handlers);

describe("isKnownEventType", () => {
  it("accepts known event types", () => {
    expect(isKnownEventType("contract")).toBe(true);
    expect(isKnownEventType("system")).toBe(true);
    expect(isKnownEventType("diagnostic")).toBe(true);
  });

  it("rejects unknown event types", () => {
    expect(isKnownEventType("other")).toBe(false);
  });
});

describe("decodeScVal", () => {
  it("decodes symbols", () => {
    expect(decodeScVal(encodeScVal(xdr.ScVal.scvSymbol("transfer")))).toBe("transfer");
  });

  it("decodes strings", () => {
    expect(decodeScVal(encodeScVal(xdr.ScVal.scvString("hello")))).toBe("hello");
  });

  it("decodes unsigned integers", () => {
    expect(decodeScVal(encodeScVal(xdr.ScVal.scvU32(42)))).toBe("42");
    expect(
      decodeScVal(encodeScVal(xdr.ScVal.scvU64(xdr.Uint64.fromString("1234567890"))))
    ).toBe("1234567890");
  });

  it("decodes booleans", () => {
    expect(decodeScVal(encodeScVal(xdr.ScVal.scvBool(true)))).toBe("true");
    expect(decodeScVal(encodeScVal(xdr.ScVal.scvBool(false)))).toBe("false");
  });

  it("decodes vectors", () => {
    const vec = xdr.ScVal.scvVec([xdr.ScVal.scvU32(1), xdr.ScVal.scvU32(2)]);
    expect(decodeScVal(encodeScVal(vec))).toBe("[1, 2]");
  });

  it("falls back to base64 for unparseable input", () => {
    expect(decodeScVal("not-base64!!!")).toBe("not-base64!!!");
  });
});

describe("runContractEvents", () => {
  it("returns decoded events for a valid contract and range", async () => {
    const result = await runContractEvents({ contractId, startLedger, endLedger }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.contractId).toBe(contractId);
    expect(result.value.latestLedger).toBe(latestLedger);
    expect(result.value.events).toHaveLength(1);

    const event = result.value.events[0];
    expect(event.type).toBe("contract");
    expect(event.topic).toEqual(["transfer"]);
    expect(event.value).toBe("42");
  });

  it("maps an empty events response to no_events", async () => {
    const result = await runContractEvents(
      { contractId: unknownContractId, startLedger, endLedger },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "no_events" });
  });

  it("maps a JSON-RPC error to rpc_error", async () => {
    server.use(rpcErrorHandler);

    const result = await runContractEvents({ contractId, startLedger, endLedger }, "testnet");
    expect(result).toEqual({ ok: false, code: "rpc_error" });
  });

  it("maps a network failure to request_failed", async () => {
    server.use(networkErrorHandler);

    const result = await runContractEvents({ contractId, startLedger, endLedger }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });

  it("rejects a range outside the retention window", async () => {
    const result = await runContractEvents(
      { contractId, startLedger: 1, endLedger: 100 },
      "testnet"
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe("range_outside_retention");
    expect(result.detail?.latestLedger).toBe(latestLedger);
  });
});
