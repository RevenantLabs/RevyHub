import { Handshake } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sponsorship-planner",
  title: "Sponsorship and Reserve Planner",
  description:
    "Plan a sponsored account setup: which subentries a sponsor covers, what reserve that costs, and what the sponsored account is left needing.",
  character: "A meticulous ledger keeper works out exactly whose reserves end up where.",
  category: "accounts",
  status: "working",
  icon: Handshake,
  networks: ["testnet", "mainnet"],
  keywords: [
    "sponsorship",
    "sponsored account",
    "reserve planner",
    "minimum balance",
    "subentries",
    "sponsoring future reserves"
  ]
};
