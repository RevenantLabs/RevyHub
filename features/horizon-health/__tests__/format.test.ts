import { expect, it } from "vitest";
import { formatHeader } from "../lib/format";
import { copy } from "../copy";
it("distinguishes absent rate headers from zero and preserves raw reset units", () => {
 expect(formatHeader(null)).toBe(copy.unavailable); expect(formatHeader("0")).toBe("0"); expect(formatHeader("1750000000")).toBe("1750000000");
});
