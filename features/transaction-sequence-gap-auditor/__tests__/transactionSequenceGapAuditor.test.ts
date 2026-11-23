import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { runTransactionSequenceGapAuditor } from "@/features/transaction-sequence-gap-auditor/lib/transactionSequenceGapAuditor";
import { accountId } from "@/features/transaction-sequence-gap-auditor/fixtures/normal.fixture";
import {
  duplicatePageHandler,
  handlers,
  incompleteWindowHandlers,
  malformedHandler,
  notFoundHandler,
  provedBumpHandlers,
  rateLimitedHandler
} from "@/features/transaction-sequence-gap-auditor/msw/handlers";

const server = withMswHandlers(...handlers);

describe("runTransactionSequenceGapAuditor", () => {
  it("audits a normal Horizon history", async () => {
    const result = await runTransactionSequenceGapAuditor({ accountId }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.coverage.transactionCount).toBe(3);
    expect(result.value.gaps).toEqual([]);
  });

  it.each([
    [rateLimitedHandler, "rate_limited"],
    [notFoundHandler, "not_found"],
    [malformedHandler, "malformed_data"]
  ] as const)("maps expected Horizon failures", async (handler, code) => {
    server.use(handler);
    expect(await runTransactionSequenceGapAuditor({ accountId }, "testnet")).toEqual({
      ok: false,
      code
    });
  });

  it("marks a bounded incomplete history without claiming a missing transaction", async () => {
    server.use(...incompleteWindowHandlers);
    const result = await runTransactionSequenceGapAuditor({ accountId }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.coverage).toMatchObject({
      transactionCount: 100,
      pagesFetched: 5,
      limitReached: true,
      incompleteEvidence: true
    });
    expect(result.value.gaps[0]?.kind).toBe("unexplained_truncated");
  });

  it("proves a bump sequence end to end", async () => {
    server.use(...provedBumpHandlers);
    const result = await runTransactionSequenceGapAuditor({ accountId }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.provedBumpCount).toBe(1);
    expect(result.value.gaps[0]?.kind).toBe("proved_bump");
  });

  it("stops when Horizon repeats a full page", async () => {
    server.use(duplicatePageHandler);
    const result = await runTransactionSequenceGapAuditor({ accountId }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.coverage).toMatchObject({
      pagesFetched: 2,
      transactionCount: 20,
      limitReached: false
    });
  });
});
