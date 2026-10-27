import { describe, expect, it } from "vitest";
import { decodeOperations } from "@/features/batch-operation-summary/lib/operation-decode";
import { mixedOperationsXdr } from "@/features/batch-operation-summary/fixtures/mixed-operations.fixture";
describe("decodeOperations", () => {
  it("decodes every operation and native amount", () => {
    const result = decodeOperations(mixedOperationsXdr);
    expect(result.ok && result.value.operations).toHaveLength(3);
    expect(result.ok && result.value.operations[0]?.nativeStroops).toBe("25000000");
  });
  it("rejects malformed XDR", () => expect(decodeOperations("not-xdr")).toEqual({ ok: false, code: "invalid_xdr" }));
});
