import { Filter } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "soroban-event-filter-composer",
  title: "Soroban Event Filter Composer",
  description:
    "Compose a Soroban RPC getEvents filter, preview the exact parameters, and optionally read a bounded page of decoded events.",
  character: "A ledger clerk who writes the filter down before asking the archive.",
  category: "soroban",
  status: "beta",
  icon: Filter,
  networks: ["testnet", "mainnet"],
  keywords: ["soroban", "events", "getEvents", "topics", "cursor"]
};
