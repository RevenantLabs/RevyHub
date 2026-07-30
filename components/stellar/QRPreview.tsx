"use client";

import { Button } from "@/components/ui/Button";
import { downloadDataUrl } from "@/lib/qrDownload";

interface QRPreviewProps {
  dataUrl: string;
  filename: string;
}

export function QRPreview({ dataUrl, filename }: QRPreviewProps) {
  function handleDownload() {
    downloadDataUrl(dataUrl, filename);
  }

  return (
    <div className="space-y-3 rounded-lg border border-white/85 bg-white/78 p-4 shadow-[4px_4px_0_rgba(199,185,243,0.24)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="Generated Stellar payment QR code" className="mx-auto h-56 w-56" />
      <Button type="button" variant="secondary" onClick={handleDownload} className="w-full">
        Download PNG
      </Button>
    </div>
  );
}
