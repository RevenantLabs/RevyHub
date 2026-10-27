import { describe, expect, it } from "vitest";
import { runBatchOperationSummary } from "@/features/batch-operation-summary/lib/batchOperationSummary";
import { mixedOperationsXdr } from "@/features/batch-operation-summary/fixtures/mixed-operations.fixture";
describe("runBatchOperationSummary", () => {
  it("summarizes counts and native amounts exactly", async () => {
    const result = await runBatchOperationSummary({ envelope: mixedOperationsXdr });
    expect(result.ok && result.value.operationTotal).toBe(3);
    expect(result.ok && result.value.nativeAmountStroops).toBe("25000000");
  });
});
