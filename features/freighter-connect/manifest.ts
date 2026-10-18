import { WalletCards } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "freighter-connect",
  title: "Freighter Connect",
  description:
    "Detect the Freighter browser wallet, read its public key and network, and surface a network mismatch before it causes a failed transaction.",
  character: "A friendly wallet mascot waves whenever Freighter is nearby.",
  category: "developer",
  status: "working",
  icon: WalletCards,
  networks: ["testnet", "mainnet"],
  keywords: ["freighter", "wallet", "connect", "browser extension", "public key", "network"]
};
