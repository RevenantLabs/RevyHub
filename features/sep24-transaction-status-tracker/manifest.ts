import { Radio } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sep24-transaction-status-tracker",
  title: "SEP-24 Transaction Status Tracker",
  description:
    "Look up one SEP-24 deposit or withdrawal on an anchor's transfer server and explain the status in plain language.",
  character: "A clerk who reads the anchor's status and never repeats the token that opened the door.",
  category: "standards",
  status: "working",
  icon: Radio,
  networks: ["testnet", "mainnet"],
  keywords: ["sep-24", "deposit", "withdrawal", "anchor", "transaction status"]
};
