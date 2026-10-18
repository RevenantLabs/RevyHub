import { History } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "effects-timeline",
  title: "Effects Timeline Viewer",
  description:
    "Read the ledger effects an account experienced as a chronological timeline, grouped by the transaction that caused them.",
  character: "An archivist comet files every consequence under the transaction that caused it.",
  category: "transactions",
  status: "working",
  icon: History,
  networks: ["testnet", "mainnet"],
  keywords: [
    "effects",
    "timeline",
    "history",
    "transaction",
    "operation",
    "ledger",
    "horizon",
    "paging"
  ]
};
