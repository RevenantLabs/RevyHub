import { History } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "operation-browser",
  title: "Operation History Browser",
  description:
    "Browse an account's Horizon operation history with type filtering, cursor paging, and plain-language parameters for each operation type.",
  character: "A ledger clerk who reads every operation out loud instead of dumping JSON.",
  category: "transactions",
  status: "working",
  icon: History,
  networks: ["testnet", "mainnet"],
  keywords: ["operations", "history", "payment", "trustline", "offer", "transactions"]
};
