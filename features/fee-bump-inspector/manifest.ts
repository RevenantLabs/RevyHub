import { Layers } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "fee-bump-inspector",
  title: "Fee-Bump Envelope Inspector",
  description:
    "Decode a fee-bump envelope in your browser and read its two layers apart — who pays, what executes, and the separate hash each layer is signed over.",
  character:
    "A careful clerk holds the envelope and the letter inside it side by side, never mistaking one for the other.",
  category: "transactions",
  status: "working",
  icon: Layers,
  networks: [],
  offline: true,
  keywords: [
    "fee bump",
    "envelope",
    "xdr",
    "decode",
    "inner transaction",
    "fee source",
    "transaction hash",
    "signatures"
  ]
};
