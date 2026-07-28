"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

interface QRPreviewProps {
  dataUrl: string;
}

export function QRPreview({ dataUrl }: QRPreviewProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/85 bg-white/78 p-4 shadow-[4px_4px_0_rgba(199,185,243,0.24)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="Generated Stellar payment QR code" className="mx-auto h-56 w-56" />
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => copy(dataUrl)}
        className="w-full"
      >
        <Copy className="mr-1.5 h-4 w-4" aria-hidden />
        {copied ? "Copied" : "Copy QR image"}
      </Button>
    </div>
  );
}
