import { expect, it } from "vitest";
import { pairOperationResults } from "../lib/operation-result-pairing";
const rows = [{ index: 0, type: "payment", code: "payment_underfunded", outerCode: "op_inner" }];
it("pairs result and operation type at the same index", () => expect(pairOperationResults(rows, ["payment"])).toMatchObject({ ok: true, value: [{ type: "payment", result: { code: "payment_underfunded" } }] }));
it.each([{ types: [] }, { types: ["bump_sequence"] }, { types: ["payment", "payment"] }])("rejects missing, mismatched or extra operation types", ({ types }) => expect(pairOperationResults(rows, types)).toEqual({ ok: false, code: "unsupported_operation" }));
