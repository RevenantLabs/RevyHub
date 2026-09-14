import { KeyRound } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "testnet-keypair-generator",
  title: "Testnet Keypair Generator",
  description:
    "Generate Stellar testnet keypairs, derive addresses from seeds, and validate key formats — fully offline.",
  character: "Every journey begins with a key — create yours for the testnet.",
  category: "keys",
  status: "working",
  icon: KeyRound,
  networks: ["testnet"],
  offline: true,
  keywords: ["keypair", "key", "generator", "testnet", "stellar", "address"],
};
