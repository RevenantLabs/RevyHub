import { Database } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-data-entries",
  title: "Account Data Entry Viewer",
  description:
    "Decode the base64 key/value data entries attached to a Stellar account.",
  character: "A moon archivist opens the account's tiny labeled data drawers.",
  category: "accounts",
  status: "working",
  icon: Database,
  networks: ["testnet", "mainnet"],
  keywords: ["account", "data", "base64", "decode", "hex", "horizon"]
};
