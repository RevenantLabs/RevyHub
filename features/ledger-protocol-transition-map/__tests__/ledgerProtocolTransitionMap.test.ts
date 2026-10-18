import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  analyzeProtocolLedgers,
  runLedgerProtocolTransitionMap
} from "@/features/ledger-protocol-transition-map/lib/ledgerProtocolTransitionMap";
import {
  emptyHistoryHandler,
  handlers,
  malformedOnlyHandler,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/ledger-protocol-transition-map/msw/handlers";
import {
  missingLedgersFixtureRecords,
  protocolLedgersFixture
} from "@/features/ledger-protocol-transition-map/fixtures/ledgerProtocolTransitionMap.fixture";

const server = withMswHandlers(...handlers);

describe("analyzeProtocolLedgers", () => {
  it("maps an exact protocol upgrade", () => {
    const result = analyzeProtocolLedgers(
      protocolLedgersFixture,
      { startLedger: 1000n, count: 4 },
      "testnet",
      false
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.transitions[0]?.certainty).toBe("exact");
    expect(result.value.runs).toHaveLength(2);
  });

  it("keeps uncertain transitions across missing ledgers", () => {
    const result = analyzeProtocolLedgers(
      missingLedgersFixtureRecords,
      { startLedger: 2000n, count: 4 },
      "testnet",
      true
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.transitions[0]?.certainty).toBe("uncertain");
    expect(result.value.gaps).toHaveLength(1);
  });
});

describe("runLedgerProtocolTransitionMap", () => {
  it("loads a Horizon page for the selected network", async () => {
    resetHorizonClients();
    const result = await runLedgerProtocolTransitionMap(
      { startLedger: 1000n, count: 4 },
      "testnet"
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.observedCount).toBe(4);
  });

  it("maps empty history", async () => {
    server.use(emptyHistoryHandler);
    resetHorizonClients();
    expect(
      await runLedgerProtocolTransitionMap({ startLedger: 1000n, count: 4 }, "testnet")
    ).toEqual({ ok: false, code: "history_unavailable" });
  });

  it("maps malformed pages", async () => {
    server.use(malformedOnlyHandler);
    resetHorizonClients();
    expect(
      await runLedgerProtocolTransitionMap({ startLedger: 1000n, count: 4 }, "testnet")
    ).toEqual({ ok: false, code: "malformed_ledger" });
  });

  it("maps rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    expect(
      await runLedgerProtocolTransitionMap({ startLedger: 1000n, count: 4 }, "testnet")
    ).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps transport failures", async () => {
    server.use(serverErrorHandler);
    resetHorizonClients();
    expect(
      await runLedgerProtocolTransitionMap({ startLedger: 1000n, count: 4 }, "testnet")
    ).toEqual({ ok: false, code: "request_failed" });
  });
});
