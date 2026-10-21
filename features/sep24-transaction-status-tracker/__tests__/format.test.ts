import { describe, expect, it } from "vitest";
import { formatAmount, formatKind } from "@/features/sep24-transaction-status-tracker/lib/format";

describe("format", () => {
  it("labels deposit and withdrawal exactly", () => {
    expect(formatKind("deposit")).toBe("Deposit");
    expect(formatKind("withdrawal")).toBe("Withdrawal");
    expect(formatKind("unknown")).toBe("Unknown");
  });

  it("renders a missing amount as Not provided", () => {
    expect(formatAmount(null)).toBe("Not provided");
    expect(formatAmount("18.34")).toBe("18.34");
  });
});
