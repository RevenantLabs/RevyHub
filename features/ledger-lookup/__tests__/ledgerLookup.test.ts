import { beforeEach, describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  normalizeLedger,
  runLedgerLookup
} from "@/features/ledger-lookup/lib/ledgerLookup";
import {
  futureSequence,
  ledgerRecordFixture,
  missingSequence,
  sampleSequence
} from "@/features/ledger-lookup/fixtures/ledgerLookup.fixture";
import {
  handlers,
  rateLimitedRootHandler,
  serverErrorRootHandler
} from "@/features/ledger-lookup/msw/handlers";

const server = withMswHandlers(...handlers);

describe("normalizeLedger", () => {
  it("normalizes a Horizon ledger record into summary presentation format", () => {
    const summary = normalizeLedger(ledgerRecordFixture as never);
    expect(summary.sequence).toBe(sampleSequence);
    expect(summary.successfulTransactionCount).toBe(125);
    expect(summary.failedTransactionCount).toBe(3);
    expect(summary.operationCount).toBe(450);
    expect(summary.totalCoins).toBe("105000000000.0000000");
    expect(summary.feePool).toBe("12345.6789000");
    expect(summary.baseFeeInStroops).toBe(100);
    expect(summary.baseReserveInStroops).toBe(5_000_000);
    expect(summary.protocolVersion).toBe(21);
  });
});

describe("runLedgerLookup", () => {
  beforeEach(() => {
    resetHorizonClients();
  });

  it("returns a summary for a valid existing ledger sequence", async () => {
    const result = await runLedgerLookup({ sequence: sampleSequence }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.sequence).toBe(sampleSequence);
    expect(result.value.successfulTransactionCount).toBe(125);
    expect(result.value.failedTransactionCount).toBe(3);
    expect(result.value.protocolVersion).toBe(21);
  });

  it("rejects sequences exceeding the current height without querying the ledger endpoint", async () => {
    const result = await runLedgerLookup({ sequence: futureSequence }, "testnet");
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe("future_ledger");
    expect(result.detail?.currentHeight).toBe(sampleSequence);
  });

  it("maps Horizon 404 to ledger_not_found for sequences within known history", async () => {
    const result = await runLedgerLookup({ sequence: missingSequence }, "testnet");
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe("ledger_not_found");
  });

  it("maps Horizon 429 to rate_limited", async () => {
    server.use(rateLimitedRootHandler);
    const result = await runLedgerLookup({ sequence: sampleSequence }, "testnet");
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe("rate_limited");
  });

  it("maps Horizon 500 to request_failed", async () => {
    server.use(serverErrorRootHandler);
    const result = await runLedgerLookup({ sequence: sampleSequence }, "testnet");
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe("request_failed");
  });
});
