import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { withMswHandlers } from "@/core/testing/msw";
import { horizonUrl, resetHorizonClients } from "@/core/horizon/client";
import {
  fetchLedgerContext,
  labelLedgerContext
} from "@/features/transaction-fee-charge-audit/lib/ledger-context";
import {
  classicLedgerRecord,
  CLASSIC_LEDGER,
  MISSING_LEDGER
} from "@/features/transaction-fee-charge-audit/fixtures/transactionFeeChargeAudit.fixture";
import { handlers } from "@/features/transaction-fee-charge-audit/msw/handlers";

const server = withMswHandlers(...handlers);

describe("labelLedgerContext", () => {
  it("labels sequence, closed time and base fee", () => {
    expect(labelLedgerContext(classicLedgerRecord)).toEqual({
      sequence: CLASSIC_LEDGER,
      closedAt: "2026-05-02T10:14:05.000Z",
      baseFeeInStroops: "100"
    });
  });

  it("tolerates missing optional fields", () => {
    expect(labelLedgerContext({ sequence: 10 })).toEqual({
      sequence: 10,
      closedAt: null,
      baseFeeInStroops: null
    });
  });
});

describe("fetchLedgerContext", () => {
  it("fetches and labels a ledger", async () => {
    resetHorizonClients();
    const result = await fetchLedgerContext(CLASSIC_LEDGER, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sequence).toBe(CLASSIC_LEDGER);
    expect(result.value.baseFeeInStroops).toBe("100");
  });

  it("maps a 404 to ledger_not_found", async () => {
    resetHorizonClients();
    const result = await fetchLedgerContext(MISSING_LEDGER, "testnet");
    expect(result).toEqual({ ok: false, code: "ledger_not_found" });
  });

  it("rejects a non-positive sequence without a request", async () => {
    expect(await fetchLedgerContext(0, "testnet")).toEqual({
      ok: false,
      code: "ledger_not_found"
    });
  });

  it("maps transport failures to request_failed", async () => {
    server.use(
      http.get(horizonUrl("testnet", `/ledgers/${CLASSIC_LEDGER}`), () =>
        HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
      )
    );
    resetHorizonClients();
    const result = await fetchLedgerContext(CLASSIC_LEDGER, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});
