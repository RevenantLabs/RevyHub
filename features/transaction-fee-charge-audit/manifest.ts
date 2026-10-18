import { Receipt } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "transaction-fee-charge-audit",
  title: "Transaction Fee Charge Audit",
  description:
    "Compare the maximum fee offered with the fee actually charged for one settled classic or fee-bump transaction.",
  character: "I read what the ledger took — never what the next one might.",
  category: "transactions",
  status: "beta",
  icon: Receipt,
  networks: ["testnet", "mainnet"],
  keywords: [
    "fee",
    "charge",
    "max fee",
    "fee bump",
    "stroops",
    "transaction fee",
    "audit"
  ]
};
