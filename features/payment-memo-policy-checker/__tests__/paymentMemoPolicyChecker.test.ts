import { describe, expect, it } from "vitest";
import { runPaymentMemoPolicyChecker } from "@/features/payment-memo-policy-checker/lib/paymentMemoPolicyChecker";

describe("runPaymentMemoPolicyChecker", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runPaymentMemoPolicyChecker({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});
