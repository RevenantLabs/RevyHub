import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "claimable-predicate-builder",
  title: "Claimable Balance Predicate Builder",
  description:
    "Build a Stellar claimable-balance predicate from a JSON tree, preview it in plain English, and export the XDR.",
  character: "I translate your time-based rules into Stellar predicates and XDR.",
  category: "assets",
  status: "beta",
  icon: Sparkles,
  networks: [],
  offline: true,
  keywords: [
    "claimable-predicate-builder",
    "claimable balance",
    "predicate",
    "xdr",
    "time lock"
  ]
};
