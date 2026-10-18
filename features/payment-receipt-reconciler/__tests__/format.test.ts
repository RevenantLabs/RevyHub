import { describe, expect, it } from "vitest";
import {
  assetKey,
  formatAmount,
  formatAmountWithAsset,
  formatAsset,
  formatFee,
  formatNetwork,
  formatPublicReceipt,
  stroopsToXlm,
  toStroops
} from "@/features/payment-receipt-reconciler/lib/format";
import { issuerAccount } from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";

describe("formatAmount", () => {
  it("formats with thousands separators and strips trailing zeros", () => {
    expect(formatAmount("12.5000000")).toBe("12.5");
    expect(formatAmount("1000.0000001")).toBe("1,000.0000001");
  });

  it("passes malformed Horizon values through", () => {
    expect(formatAmount("not-an-amount")).toBe("not-an-amount");
  });
});

describe("toStroops", () => {
  it("converts without floating point", () => {
    expect(toStroops("1.0000000")).toBe(10_000_000n);
    expect(toStroops("0.0000001")).toBe(1n);
  });
});

describe("formatAsset", () => {
  it("renders native and credit assets", () => {
    expect(formatAsset({ type: "native" })).toBe("XLM");
    expect(formatAsset({ type: "credit", code: "USDC", issuer: issuerAccount })).toBe(
      `USDC:${issuerAccount}`
    );
  });
});

describe("assetKey", () => {
  it("keys native and credit assets distinctly", () => {
    expect(assetKey({ type: "native" })).toBe("native");
    expect(assetKey({ type: "credit", code: "USDC", issuer: issuerAccount })).toBe(
      `USDC:${issuerAccount}`
    );
  });
});

describe("formatFee", () => {
  it("shows stroops and XLM together", () => {
    expect(stroopsToXlm("100")).toBe("0.00001");
    expect(formatFee("100")).toBe("100 stroops (0.00001 XLM)");
  });
});

describe("formatPublicReceipt", () => {
  it("builds a copyable three-line receipt", () => {
    expect(
      formatPublicReceipt({
        hash: "a".repeat(64),
        network: "testnet",
        ledger: 42
      })
    ).toContain("Testnet");
    expect(formatNetwork("mainnet")).toBe("Mainnet");
  });
});

describe("formatAmountWithAsset", () => {
  it("joins amount and compact asset label", () => {
    expect(formatAmountWithAsset("1.5", { type: "native" })).toBe("1.5 XLM");
  });
});
