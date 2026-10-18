import { Coins } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "fee-stats",
  title: "Network Fee Statistics",
  description:
    "Read the current fee distribution and ledger capacity usage, and turn them into a concrete fee recommendation.",
  character: "A ledger clerk reads the room and tells you what a seat costs right now.",
  category: "network",
  status: "working",
  icon: Coins,
  networks: ["testnet", "mainnet"],
  keywords: ["fee", "stroops", "surge", "capacity", "percentile", "fee_stats", "base fee"]
};
