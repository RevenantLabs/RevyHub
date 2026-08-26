import { GitMerge } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-merge-preflight",
  title: "Account Merge Preflight Check",
  description: "Check every visible account-merge precondition and identify the exact trustlines, offers, data and reserve obligations blocking it.",
  character: "A careful gatekeeper checks every latch before two Stellar accounts become one.",
  category: "accounts",
  status: "working",
  icon: GitMerge,
  networks: ["testnet", "mainnet"],
  keywords: ["account merge", "preflight", "trustline", "offer", "sponsorship", "signer"]
};
