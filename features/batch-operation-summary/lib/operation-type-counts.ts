import type { OperationTypeCount } from "@/features/batch-operation-summary/types";

export interface CountableOperation { type: string }

export function countOperationTypes(operations: CountableOperation[]): OperationTypeCount[] {
  const counts = new Map<string, number>();
  for (const operation of operations) counts.set(operation.type, (counts.get(operation.type) ?? 0) + 1);
  return [...counts].map(([type, count]) => ({ type, count })).sort((a, b) => a.type.localeCompare(b.type));
}
