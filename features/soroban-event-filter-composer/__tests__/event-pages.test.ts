import { expect, it } from "vitest";
import { MAX_EVENT_ROWS, cursorForNetwork, mergeEventPages } from "../lib/event-pages";
import { firstPage, otherNetworkPage, row, secondPage, testnet } from "../fixtures/event-pages.fixture";

it("appends pages on the same network and drops them after a network change", () => {
  const merged = mergeEventPages(firstPage, secondPage);
  expect(merged.rows.map((item) => item.id)).toEqual(["a", "b"]);
  expect(merged.cursor).toBe("cursor-b");
  const switched = mergeEventPages(merged, otherNetworkPage);
  expect(switched.rows.map((item) => item.id)).toEqual(["c"]);
  expect(switched.network).toBe("mainnet");
});

it("caps the row count and ignores a stale cursor", () => {
  const huge = { network: testnet, rows: Array.from({ length: MAX_EVENT_ROWS + 3 }, (_, index) => row(String(index))) };
  const merged = mergeEventPages(null, huge);
  expect(merged.rows).toHaveLength(MAX_EVENT_ROWS);
  expect(merged.truncated).toBe(true);
  expect(cursorForNetwork("cursor-1", "mainnet", "testnet")).toBeUndefined();
  expect(cursorForNetwork("cursor-1", "testnet", "testnet")).toBe("cursor-1");
});
