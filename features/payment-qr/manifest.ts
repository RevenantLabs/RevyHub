import { QrCode } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "payment-qr",
  title: "Payment QR Generator",
  description:
    "Build a SEP-0007 payment request URI and render it as a scannable QR code, entirely in your browser.",
  character: "A rocket assistant frames your payment details as a poster worth scanning.",
  category: "payments",
  status: "working",
  icon: QrCode,
  networks: [],
  offline: true,
  keywords: ["qr", "payment", "sep-0007", "web+stellar", "uri", "request", "invoice"]
};
