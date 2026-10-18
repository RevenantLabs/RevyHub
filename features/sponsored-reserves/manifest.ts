import { HandCoins } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sponsored-reserves",
  title: "Sponsored Reserves Inspector",
  description:
    "See which of an account's entries are sponsored, who pays for them and the net reserve effect in XLM.",
  character: "A careful fox traces every borrowed reserve back to the wallet paying for it.",
  category: "accounts",
  status: "working",
  icon: HandCoins,
  networks: ["testnet", "mainnet"],
  keywords: ["sponsorship", "sponsored reserves", "account", "subentries", "minimum balance"]
};
