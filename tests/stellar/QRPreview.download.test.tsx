import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QRPreview } from "@/components/stellar/QRPreview";
import { buildPaymentQrFilename } from "@/lib/qrDownload";

describe("buildPaymentQrFilename", () => {
  it("uses a deterministic XLM filename without account addresses", () => {
    expect(buildPaymentQrFilename({ asset: "XLM" })).toBe("stellar-payment-qr-xlm.png");
  });

  it("sanitizes issued asset codes for a safe filename", () => {
    expect(buildPaymentQrFilename({ asset: "ISSUED", assetCode: "USDC!" })).toBe(
      "stellar-payment-qr-usdc.png"
    );
  });
});

describe("QRPreview download", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("offers Download PNG for an existing QR data URL and uses that exact href", async () => {
    const user = userEvent.setup();
    const dataUrl = "data:image/png;base64,abc123";
    const click = vi.fn();
    let capturedHref: string | null = null;
    let capturedDownload: string | null = null;
    const originalAppend = document.body.appendChild.bind(document.body);

    vi.spyOn(document.body, "appendChild").mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement && node.download) {
        capturedHref = node.getAttribute("href");
        capturedDownload = node.getAttribute("download");
        Object.defineProperty(node, "click", { configurable: true, value: click });
      }
      return originalAppend(node);
    });

    render(<QRPreview dataUrl={dataUrl} filename="stellar-payment-qr-xlm.png" />);

    expect(screen.getByRole("button", { name: "Download PNG" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Download PNG" }));

    expect(click).toHaveBeenCalled();
    expect(capturedHref).toBe(dataUrl);
    expect(capturedDownload).toBe("stellar-payment-qr-xlm.png");
  });
});
