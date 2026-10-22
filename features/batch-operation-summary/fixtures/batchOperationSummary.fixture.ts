import type { BatchOperationSummaryResult } from "@/features/batch-operation-summary/types";
export const batchOperationSummaryFixture: BatchOperationSummaryResult = {
  operationTotal: 2,
  typeCounts: [{ type: "payment", count: 2 }],
  nativeAmountStroops: "30000000",
  transactionSource: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  operationSources: []
};
