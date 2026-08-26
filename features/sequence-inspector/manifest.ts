import { Hash } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sequence-inspector",
  title: "Sequence Number Inspector",
  description:
    "Show an account's current sequence number, the next valid sequence, and how a bump-sequence operation would change it.",
  character: "A numerical detective inspecting accounts.",
  category: "accounts",
  status: "working",
  icon: Hash,
  networks: ["testnet", "mainnet"],
  keywords: ["sequence", "number", "bump", "ledger", "offset", "tx_bad_seq"]
};
