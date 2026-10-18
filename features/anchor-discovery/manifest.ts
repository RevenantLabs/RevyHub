import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "anchor-discovery",
  title: "Anchor Endpoint Discovery",
  description: "Discover an anchor's SEP endpoints and currency metadata from its stellar.toml.",
  character: "A patient cartographer maps standards from one HTTPS document.",
  category: "standards",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["anchor", "stellar.toml", "sep-6", "sep-10", "sep-24"]
};
