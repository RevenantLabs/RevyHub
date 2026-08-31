import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sep7-signature-verifier",
  title: "SEP-0007 URI Signature Verifier",
  description: "Verify that a SEP-0007 payment request was signed by its declared domain.",
  character: "A domain signature proves who signed the request, not whether you should pay it.",
  category: "standards",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["sep-0007", "web+stellar", "signature", "origin domain", "stellar.toml"]
};
