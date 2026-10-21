import { LineChart } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sep38-quote-viewer",
  title: "SEP-38 Indicative Quote Viewer",
  description:
    "Look up a SEP-38 indicative price for one off-chain and one on-chain asset from an anchor's public price endpoint.",
  character: "A careful clerk reads the public rate board and never promises a trade.",
  category: "standards",
  status: "beta",
  icon: LineChart,
  networks: ["testnet", "mainnet"],
  keywords: ["sep-38", "indicative", "anchor", "price", "stellar.toml", "quote"]
};
