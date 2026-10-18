import { GitCompareArrows } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "soroban-footprint-diff",
  title: "Soroban Footprint Difference Inspector",
  description:
    "Compare read-only and read-write ledger-key footprints from two pasted simulation results offline.",
  character: "A cartographer overlays two proposed footprints and circles every mode flip.",
  category: "soroban",
  status: "working",
  icon: GitCompareArrows,
  networks: [],
  offline: true,
  keywords: ["soroban", "footprint", "simulation", "ledger key", "diff"]
};
