import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "contract-events",
  title: "Soroban Contract Event Viewer",
  description: "TODO: one sentence describing what this tool does.",
  character: "TODO: one in-world character line.",
  category: "soroban",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["contract-events"]
};
