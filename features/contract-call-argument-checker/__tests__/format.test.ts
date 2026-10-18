import { expect, it } from "vitest";
import { formatMismatch, formatReport } from "../lib/format";

it("formats a nested path without reordering the words", () => {
  expect(formatMismatch("argument 2 > field owner", "address", "u32")).toBe("argument 2 > field owner: expected address, actual u32");
  expect(formatReport({ functionNames: [], selected: "transfer", expected: [], actual: [], mismatches: [] })).toContain('"selected": "transfer"');
});
