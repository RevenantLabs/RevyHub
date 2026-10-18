import { expect, it } from "vitest";
import { buildEventFilter, toGetEventsParams } from "../lib/filter-builder";
import { contractId, sample } from "../fixtures/sorobanEventFilterComposer.fixture";

it("builds contract-typed parameters and omits a cursor from another network", () => {
  const built = buildEventFilter({ ...sample, cursor: "cursor-1", cursorNetwork: "mainnet", network: "testnet" });
  expect(built.ok).toBe(true);
  if (!built.ok) return;
  expect(built.value.contractIds).toEqual([contractId]);
  expect(built.value.eventType).toBe("contract");
  expect(built.value.cursor).toBeUndefined();
  const params = toGetEventsParams({ ...built.value, cursor: "cursor-1" });
  expect(params.pagination.cursor).toBe("cursor-1");
  expect(params.filters[0]?.topics?.[0]?.[0]).toMatch(/^[A-Za-z0-9+/]+=*$/);
  expect(params.startLedger).toBe(150);
});

it("keeps a cursor when it belongs to the selected network", () => {
  const built = buildEventFilter({ ...sample, cursor: "cursor-1", cursorNetwork: "testnet", network: "testnet" });
  expect(built.ok && built.value.cursor).toBe("cursor-1");
});
