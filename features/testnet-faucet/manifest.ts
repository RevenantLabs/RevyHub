import { Droplets } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "testnet-faucet",
  title: "Testnet Faucet",
  description:
    "Fund a Stellar testnet account through Friendbot and see exactly why a request was refused.",
  character: "A faucet character pours harmless testnet XLM, and only ever on testnet.",
  category: "network",
  status: "working",
  icon: Droplets,
  networks: ["testnet"],
  keywords: ["friendbot", "faucet", "fund", "testnet", "xlm", "create account"]
};
