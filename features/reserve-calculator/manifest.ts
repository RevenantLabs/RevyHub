import { Calculator } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "reserve-calculator",
  title: "Minimum Balance and Reserve Calculator",
  description:
    "Break down an account's live XLM reserve and see how much is actually spendable.",
  character: "A careful fox counts every locked lumen before opening the coin purse.",
  category: "accounts",
  status: "beta",
  icon: Calculator,
  networks: ["testnet", "mainnet"],
  keywords: ["reserve", "minimum balance", "spendable", "xlm", "sponsorship", "account"]
};
