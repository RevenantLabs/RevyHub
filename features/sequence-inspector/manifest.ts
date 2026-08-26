import { ListOrdered } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sequence-inspector",
  title: "Sequence Number Inspector",
  description: "Decode an account sequence number, find the next valid value and validate a bump target without losing precision.",
  character: "A meticulous ledger keeper separates every sequence into its exact high and low bits.",
  category: "accounts",
  status: "working",
  icon: ListOrdered,
  networks: ["testnet", "mainnet"],
  keywords: ["sequence", "account", "bump sequence", "tx_bad_seq", "ledger", "int64"]
};
