import { describe, expect, it } from "vitest";
import { runSep24TransactionStatusTracker } from "@/features/sep24-transaction-status-tracker/lib/sep24TransactionStatusTracker";
import { completedWithdrawal } from "@/features/sep24-transaction-status-tracker/fixtures/completed-withdrawal.fixture";
import {
  homeDomain,
  liveToken,
  pendingDeposit,
  toml,
  tomlUrl,
  tomlWithoutServer,
  transactionId,
  transferServer
} from "@/features/sep24-transaction-status-tracker/fixtures/sep24TransactionStatusTracker.fixture";

const input = { homeDomain, transactionId, token: liveToken };

function fetchRoutes(options: { tomlBody?: string; txStatus?: number; txBody?: unknown }): typeof fetch {
  return (async (url: string | URL | Request) => {
    const target = String(url);
    if (target === tomlUrl) return new Response(options.tomlBody ?? toml, { status: 200 });
    if (target === `${transferServer}/transactions/${transactionId}`) {
      return new Response(JSON.stringify(options.txBody ?? pendingDeposit), {
        status: options.txStatus ?? 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("missing", { status: 404 });
  }) as typeof fetch;
}

describe("runSep24TransactionStatusTracker", () => {
  it("explains a pending deposit and omits the token", async () => {
    const result = await runSep24TransactionStatusTracker(input, undefined, { fetchImpl: fetchRoutes({}) });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("pending_external");
    expect(result.value.explanation).toMatch(/off-chain/i);
    expect(JSON.stringify(result.value)).not.toContain(liveToken);
  });

  it("explains a completed withdrawal", async () => {
    const result = await runSep24TransactionStatusTracker(
      { ...input, transactionId: "wd-100" },
      undefined,
      {
        fetchImpl: (async (url: string | URL | Request) => {
          if (String(url) === tomlUrl) return new Response(toml, { status: 200 });
          return new Response(JSON.stringify(completedWithdrawal), { status: 200 });
        }) as typeof fetch
      }
    );
    expect(result.ok && result.value.kind).toBe("withdrawal");
    expect(result.ok && result.value.status).toBe("completed");
  });

  it("reports a missing transfer server, a refused token, and a missing transaction", async () => {
    expect(
      await runSep24TransactionStatusTracker(input, undefined, {
        fetchImpl: fetchRoutes({ tomlBody: tomlWithoutServer })
      })
    ).toEqual({ ok: false, code: "missing_transfer_server" });

    expect(
      await runSep24TransactionStatusTracker(input, undefined, { fetchImpl: fetchRoutes({ txStatus: 401 }) })
    ).toEqual({ ok: false, code: "unauthorized" });

    expect(
      await runSep24TransactionStatusTracker(input, undefined, { fetchImpl: fetchRoutes({ txStatus: 404 }) })
    ).toEqual({ ok: false, code: "transaction_not_found" });
  });
});
