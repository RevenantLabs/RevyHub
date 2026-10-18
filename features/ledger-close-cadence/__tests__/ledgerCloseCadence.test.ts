import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  analyzeLedgerSample,
  runLedgerCloseCadence
} from "@/features/ledger-close-cadence/lib/ledgerCloseCadence";
import {
  emptyHistoryHandler,
  handlers,
  malformedOnlyHandler,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/ledger-close-cadence/msw/handlers";
import {
  gapsFixtureRecords,
  recentLedgersFixture,
  repeatedTimestampRecords
} from "@/features/ledger-close-cadence/fixtures/ledgerCloseCadence.fixture";

const server = withMswHandlers(...handlers);

describe("analyzeLedgerSample", () => {
  it("computes median/min/max intervals for a contiguous sample", () => {
    const result = analyzeLedgerSample(recentLedgersFixture, { sampleSize: 4 }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.stats).toEqual({
      medianMs: 5000,
      minMs: 5000,
      maxMs: 5000,
      intervalCount: 3
    });
    expect(result.value.firstLedger.sequence).toBe("1001");
    expect(result.value.lastLedger.sequence).toBe("1004");
    expect(result.value.sequenceGaps).toEqual([]);
  });

  it("flags sequence gaps separately from long close intervals", () => {
    const result = analyzeLedgerSample(gapsFixtureRecords, { sampleSize: 4 }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sequenceGaps).toHaveLength(1);
    expect(result.value.intervals.some((interval) => interval.unusual)).toBe(true);
  });

  it("keeps repeated timestamps without corrupting the sample", () => {
    const result = analyzeLedgerSample(repeatedTimestampRecords, { sampleSize: 4 }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.repeatedTimestampCount).toBe(1);
    expect(result.value.observedSampleSize).toBe(4);
  });
});

describe("runLedgerCloseCadence", () => {
  it("loads a Horizon ledger page for the selected network", async () => {
    resetHorizonClients();
    const result = await runLedgerCloseCadence({ sampleSize: 4 }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.network).toBe("testnet");
    expect(result.value.observedSampleSize).toBe(4);
  });

  it("maps an empty history page", async () => {
    server.use(emptyHistoryHandler);
    resetHorizonClients();
    expect(await runLedgerCloseCadence({ sampleSize: 4 }, "testnet")).toEqual({
      ok: false,
      code: "history_unavailable"
    });
  });

  it("maps a fully malformed page", async () => {
    server.use(malformedOnlyHandler);
    resetHorizonClients();
    expect(await runLedgerCloseCadence({ sampleSize: 4 }, "testnet")).toEqual({
      ok: false,
      code: "malformed_ledger"
    });
  });

  it("maps rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    expect(await runLedgerCloseCadence({ sampleSize: 4 }, "testnet")).toEqual({
      ok: false,
      code: "rate_limited"
    });
  });

  it("maps transport failures", async () => {
    server.use(serverErrorHandler);
    resetHorizonClients();
    expect(await runLedgerCloseCadence({ sampleSize: 4 }, "testnet")).toEqual({
      ok: false,
      code: "request_failed"
    });
  });
});
