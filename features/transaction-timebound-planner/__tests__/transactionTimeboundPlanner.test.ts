import { describe, expect, it } from "vitest";
import { runTransactionTimeboundPlanner } from "@/features/transaction-timebound-planner/lib/transactionTimeboundPlanner";

describe("runTransactionTimeboundPlanner", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runTransactionTimeboundPlanner({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});
