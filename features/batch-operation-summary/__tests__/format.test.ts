import { describe, expect, it } from "vitest";
import { formatNativeAmount, formatOperationType } from "@/features/batch-operation-summary/lib/format";
describe("batch formatting", () => {
  it("formats stroops without floating point", () => expect(formatNativeAmount("25000001")).toBe("2.5000001 XLM"));
  it("formats operation enum names", () => expect(formatOperationType("pathPaymentStrictSend")).toBe("path payment strict send"));
});
