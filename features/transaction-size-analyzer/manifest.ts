import { Ruler } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "transaction-size-analyzer",
  title: "Transaction Envelope Byte-Size Analyzer",
  description:
    "Measure what a transaction envelope actually weighs — real XDR bytes, not base64 characters — and see which operations and signatures account for them.",
  character: "A patient weigher puts the envelope on the scale and itemises every gram.",
  category: "transactions",
  status: "working",
  icon: Ruler,
  networks: [],
  offline: true,
  keywords: [
    "size",
    "bytes",
    "xdr",
    "base64",
    "envelope",
    "operations",
    "signatures",
    "budget",
    "payload"
  ]
};
