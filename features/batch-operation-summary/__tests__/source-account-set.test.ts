import { describe, expect, it } from "vitest";
import { decodeOperations } from "@/features/batch-operation-summary/lib/operation-decode";
import { overrideSourceKey, sourceOverrideXdr, transactionSourceKey } from "@/features/batch-operation-summary/fixtures/operation-source-override.fixture";
describe("source accounts", () => {
  it("separates transaction source and overrides", () => {
    const result = decodeOperations(sourceOverrideXdr);
    expect(result.ok && result.value.transactionSource).toBe(transactionSourceKey.publicKey());
    expect(result.ok && result.value.operationSources).toEqual([overrideSourceKey.publicKey()]);
  });
});
