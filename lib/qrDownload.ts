export function buildPaymentQrFilename(input: {
  asset: "XLM" | "ISSUED";
  assetCode?: string;
}) {
  const code =
    input.asset === "XLM"
      ? "xlm"
      : (input.assetCode || "asset")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 12) || "asset";

  return `stellar-payment-qr-${code}.png`;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
