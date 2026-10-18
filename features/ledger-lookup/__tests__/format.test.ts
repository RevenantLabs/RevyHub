import { expect, it } from "vitest";
import { formatAge, formatValue } from "../lib/format";
import { copy } from "../copy";
it("keeps amounts exact and absence distinct from zero", () => {expect(formatValue("900719925.4740993")).toBe("900719925.4740993"); expect(formatValue(0)).toBe("0"); expect(formatValue(null)).toBe(copy.unavailable);});
it("anchors age to observation and detects clock skew", () => {expect(formatAge("2026-09-12T08:59:00Z", "2026-09-12T09:00:00Z")).toBe(copy.secondsAgo(60)); expect(formatAge("2026-09-13", "2026-09-12")).toBe(copy.afterObservation); expect(formatAge("invalid", "invalid")).toBe(copy.unavailable);});
