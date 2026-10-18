import { GitBranch } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "operation-source-map",
  title: "Transaction Operation Source Map",
  description:
    "See which account supplies the source for every operation in an envelope, and which ones quietly override the transaction source.",
  character: "A meticulous usher checks each seat against the ticket, not against the party name.",
  category: "transactions",
  status: "working",
  icon: GitBranch,
  networks: [],
  offline: true,
  keywords: [
    "operation",
    "source",
    "override",
    "muxed",
    "envelope",
    "xdr",
    "authorization",
    "fee bump"
  ]
};
