import { describe, expect, it } from "vitest";
import {
  countInvocationNodes,
  maxInvocationDepth
} from "@/features/soroban-auth-inspector/lib/format";
import type { AuthInvocationNode } from "@/features/soroban-auth-inspector/types";

describe("countInvocationNodes", () => {
  it("counts the root and all nested invocations", () => {
    const node: AuthInvocationNode = {
      contractId: null,
      functionName: "root",
      args: [],
      subInvocations: [
        { contractId: null, functionName: "child1", args: [], subInvocations: [] },
        {
          contractId: null,
          functionName: "child2",
          args: [],
          subInvocations: [{ contractId: null, functionName: "grandchild", args: [], subInvocations: [] }]
        }
      ]
    };

    expect(countInvocationNodes(node)).toBe(4);
  });
});

describe("maxInvocationDepth", () => {
  it("returns the deepest branch", () => {
    const node: AuthInvocationNode = {
      contractId: null,
      functionName: "root",
      args: [],
      subInvocations: [
        { contractId: null, functionName: "child1", args: [], subInvocations: [] },
        {
          contractId: null,
          functionName: "child2",
          args: [],
          subInvocations: [{ contractId: null, functionName: "grandchild", args: [], subInvocations: [] }]
        }
      ]
    };

    expect(maxInvocationDepth(node)).toBe(3);
  });
});
