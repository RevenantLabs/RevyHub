import { Database } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-data-entries",
  title: "Account Data Entry Viewer",
  description:
    "Inspect an account's Horizon data entries and decode each base64 value as text or raw bytes.",
  character: "A careful fox opens the account ledger one entry at a time.",
  category: "accounts",
  status: "working",
  icon: Database,
  networks: ["testnet", "mainnet"],
  keywords: ["account", "data", "base64", "horizon", "entries", "decode"]
};
