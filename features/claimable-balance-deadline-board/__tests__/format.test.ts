import { expect, it } from "vitest";
import { formatBalanceAmount, formatBalanceAsset, formatDeadline } from "../lib/format";
it("formats exact amounts, assets and UTC deadline", () => {
  expect(formatBalanceAmount("125.5000000")).toBe("125.5");
  expect(formatBalanceAmount("9007199254740993.0000001")).toBe("9,007,199,254,740,993.0000001");
  expect(formatBalanceAsset("native")).toBe("XLM");
  expect(formatDeadline("2026-10-01T00:00:00.000Z")).toBe("2026-10-01 00:00:00 UTC");
});
