import { ShieldCheck } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "multisig-analyzer",
  title: "Multisig Signature Weight Analyzer",
  description:
    "Inspect a transaction envelope, calculate the required threshold, and show which signer weights are still missing.",
  character: "A careful fox counts the signatures on every operation before the ledger accepts it.",
  category: "accounts",
  status: "working",
  icon: ShieldCheck,
  networks: ["testnet", "mainnet"],
  keywords: ["multisig", "signature", "threshold", "transaction", "stellar", "auth"]
};
