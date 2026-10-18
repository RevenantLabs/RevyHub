import type { ActivityOperation } from "@/features/account-activity-rollup/types";

export const overlappingOperations: ActivityOperation[] = [
  { pagingToken: "19", type: "payment", createdAt: "2024-01-16T00:00:00.000Z" },
  { pagingToken: "18", type: "change_trust", createdAt: "2024-01-15T23:59:59.000Z" },
  { pagingToken: "17", type: "payment", createdAt: "2024-01-15T12:00:00.000Z" }
];
export const malformedOperation = { paging_token: "16", type: "payment", created_at: "not-a-date" };
