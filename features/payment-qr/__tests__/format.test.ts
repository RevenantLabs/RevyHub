import { describe, expect, it } from "vitest";
import { formatAmount, formatAsset } from "@/features/payment-qr/lib/format";
import { renderQrSvg } from "@/features/payment-qr/lib/qrCode";
import { issuer } from "@/features/payment-qr/fixtures/paymentQr.fixture";

describe("formatAsset", () => {
  it("names the native asset", () => {
    expect(formatAsset({ kind: "native" })).toMatch(/native/);
  });

  it("uses CODE:ISSUER for issued assets", () => {
    expect(formatAsset({ kind: "issued", code: "USDC", issuer })).toBe(`USDC:${issuer}`);
  });
});

describe("formatAmount", () => {
  it("trims trailing zeros without changing the value", () => {
    expect(formatAmount("10.5000000")).toBe("10.5");
    expect(formatAmount("10.0000000")).toBe("10");
    expect(formatAmount("10")).toBe("10");
  });
});

describe("renderQrSvg", () => {
  it("produces inline SVG that needs no canvas", async () => {
    const svg = await renderQrSvg("web+stellar:pay?destination=G&amount=1");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("encodes different payloads differently", async () => {
    const [a, b] = await Promise.all([renderQrSvg("a"), renderQrSvg("b")]);
    expect(a).not.toBe(b);
  });
});
