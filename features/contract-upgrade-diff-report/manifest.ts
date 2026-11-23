import { GitCompareArrows } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "contract-upgrade-diff-report",
  title: "Contract Upgrade Compatibility Diff Report",
  description:
    "Compare two Soroban Wasm files locally and report added, removed and changed functions, types, errors, environment versions and publisher metadata — without executing either binary.",
  character: "An archivist lays the old charter beside the new one and marks every clause that moved.",
  category: "soroban",
  status: "beta",
  icon: GitCompareArrows,
  networks: [],
  offline: true,
  keywords: [
    "soroban",
    "wasm",
    "upgrade",
    "compatibility",
    "diff",
    "contractspecv0",
    "contractenvmetav0",
    "contractmetav0",
    "interface",
    "code hash"
  ]
};
