import type { AuthInvocationNode } from "@/features/soroban-auth-inspector/types";

/**
 * Counts the total number of invocation nodes in an authorization tree,
 * including the root and all nested sub-invocations.
 */
export function countInvocationNodes(node: AuthInvocationNode): number {
  return 1 + node.subInvocations.reduce((sum, child) => sum + countInvocationNodes(child), 0);
}

/**
 * Counts the maximum depth of an authorization tree.
 */
export function maxInvocationDepth(node: AuthInvocationNode): number {
  if (node.subInvocations.length === 0) return 1;
  return 1 + Math.max(...node.subInvocations.map(maxInvocationDepth));
}
