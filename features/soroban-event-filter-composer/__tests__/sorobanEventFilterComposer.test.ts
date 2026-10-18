import { expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { SOROBAN_RPC_URLS } from "@/core/network/config";
import { withMswHandlers } from "@/core/testing/msw";
import { parseInput } from "../schema";
import { composeEventFilter } from "../lib/sorobanEventFilterComposer";
import { handlers } from "../msw/handlers";
import { emptyContractId, sample } from "../fixtures/sorobanEventFilterComposer.fixture";

const server = withMswHandlers(...handlers);

it("reads and decodes one event page", async () => {
  const parsed = parseInput(sample, "testnet");
  expect(parsed.ok).toBe(true);
  if (!parsed.ok) return;
  const result = await composeEventFilter(parsed.value, "testnet");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.value.rows[0]?.topics[0]).toBe("symbol transfer");
  expect(result.value.rows[0]?.value).toBe("u32 7");
  expect(result.value.filter.startLedger).toBe(150);
});

it("reports an empty page, missing history, rate limits and transport failure", async () => {
  const empty = parseInput({ ...sample, contractIds: emptyContractId }, "testnet");
  if (!empty.ok) throw new Error("fixture");
  const none = await composeEventFilter(empty.value, "testnet");
  expect(none.ok && none.value.rows).toEqual([]);

  const old = parseInput({ ...sample, startLedger: "50" }, "testnet");
  if (!old.ok) throw new Error("fixture");
  const history = await composeEventFilter(old.value, "testnet");
  expect(!history.ok && history.code).toBe("history_unavailable");

  server.use(http.post(SOROBAN_RPC_URLS.testnet, () => HttpResponse.json({ jsonrpc: "2.0", id: 1, error: { code: 429, message: "rate limit" } })));
  const limited = await composeEventFilter(empty.value, "testnet");
  expect(!limited.ok && limited.code).toBe("rate_limited");

  server.use(http.post(SOROBAN_RPC_URLS.testnet, () => HttpResponse.json({ error: "nope" }, { status: 503 })));
  const failed = await composeEventFilter(empty.value, "testnet");
  expect(!failed.ok && failed.code).toBe("request_failed");
});
