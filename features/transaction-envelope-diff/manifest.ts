import { GitCompare } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "transaction-envelope-diff",
  title: "Transaction Envelope Difference Viewer",
  description:
    "Compare two transaction envelopes field by field instead of squinting at two base64 strings, with signature changes kept apart from body changes.",
  character: "A proofreader lays two drafts side by side and points at every word that moved.",
  category: "transactions",
  status: "working",
  icon: GitCompare,
  networks: [],
  offline: true,
  keywords: [
    "diff",
    "compare",
    "envelope",
    "xdr",
    "before after",
    "review",
    "signature",
    "fee bump"
  ]
};
