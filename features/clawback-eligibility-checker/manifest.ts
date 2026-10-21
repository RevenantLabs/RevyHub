import { ShieldAlert } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "clawback-eligibility-checker",
  title: "Clawback Eligibility Checker",
  description:
    "Check whether a holder's trustline for an asset is currently clawback-eligible, combining the issuer's and the holder's own clawback flags.",
  character: "An auditor who checks both ledgers before signing off.",
  category: "assets",
  status: "beta",
  icon: ShieldAlert,
  networks: ["testnet", "mainnet"],
  keywords: ["clawback", "trustline", "auth_clawback_enabled", "is_clawback_enabled"]
};
