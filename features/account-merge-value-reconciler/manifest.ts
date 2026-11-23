import { GitMerge } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-merge-value-reconciler",
  title: "Account Merge Value Reconciler",
  description: "Compare account merge proceeds in transaction results with operation metadata and keep fees separate.",
  character: "An auditor traces each merge transfer to its operation and flags missing evidence.",
  category: "accounts",
  status: "working",
  icon: GitMerge,
  networks: [],
  offline: true,
  keywords: ["account merge", "reconciliation", "result XDR", "metadata", "fee bump"]
};
