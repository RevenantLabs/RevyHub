import { Globe } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "network-passphrase-inspector",
  title: "Network Passphrase Inspector",
  description:
    "Browse Stellar network passphrases, their properties, and Horizon RPC URLs — fully offline.",
  character: "Every network has its own voice — learn to recognize them.",
  category: "network",
  status: "working",
  icon: Globe,
  networks: [],
  offline: true,
  keywords: ["network", "passphrase", "stellar", "horizon", "rpc", "testnet", "mainnet"],
};
