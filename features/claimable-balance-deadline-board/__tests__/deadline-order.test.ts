import { expect, it } from "vitest";
import { orderDeadlines } from "../lib/deadline-order";
import type { DeadlineRow } from "../types";
const row = (id: string, deadline?: string): DeadlineRow => ({ id, amount: "1", asset: "native", pagingToken: id, predicate: { kind: "unconditional" }, deadline });
it("orders dated rows by time and keeps undated rows separate", () => {
  const result = orderDeadlines([row("late", "2027-01-01T00:00:00Z"), row("none"), row("early", "2026-01-01T00:00:00Z")]);
  expect(result.dated.map((item) => item.id)).toEqual(["early", "late"]);
  expect(result.undated.map((item) => item.id)).toEqual(["none"]);
});
