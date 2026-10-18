import { Scale } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "offer-liability-headroom",
  title: "Offer Liability and Capacity Audit",
  description:
    "Inspect an account's offers alongside balances and liabilities to explain which obligations constrain further offers.",
  character: "A desk auditor lines up offers against the ledger sheet and circles the tight spots.",
  category: "developer",
  status: "working",
  icon: Scale,
  networks: ["testnet", "mainnet"],
  keywords: ["offer", "liability", "trustline", "DEX", "capacity", "price_r"]
};
