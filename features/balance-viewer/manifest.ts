import { CircleDollarSign } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "balance-viewer",
  title: "Balance Viewer",
  description:
    "Inspect every balance an account holds on Horizon, including issued assets and liquidity pool shares.",
  character: "A moon wallet opens all of its pockets so you can count what is inside.",
  category: "accounts",
  status: "working",
  icon: CircleDollarSign,
  networks: ["testnet", "mainnet"],
  keywords: ["balance", "account", "horizon", "xlm", "assets", "liquidity pool"]
};
