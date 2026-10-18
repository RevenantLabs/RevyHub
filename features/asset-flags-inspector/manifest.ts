import { Shield } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "asset-flags-inspector",
  title: "Issuer Authorization Flags Inspector",
  description:
    "Look up an issuing account's authorization flags on Horizon and explain, in plain language, what each flag lets the issuer do to holders.",
  character: "A careful clerk reads the fine print on who really controls an asset.",
  category: "assets",
  status: "working",
  icon: Shield,
  networks: ["testnet", "mainnet"],
  keywords: [
    "asset",
    "issuer",
    "authorization",
    "auth_required",
    "auth_revocable",
    "clawback",
    "auth_immutable",
    "flags"
  ]
};
