import { ListOrdered } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "transaction-sequence-gap-auditor",
  title: "Transaction Sequence Gap Auditor",
  description: "Audit recent Horizon transaction history for explained and unexplained sequence gaps.",
  character: "Trace every jump; label only what the evidence can prove.",
  category: "transactions",
  status: "beta",
  icon: ListOrdered,
  networks: ["testnet", "mainnet"],
  keywords: ["sequence", "gap", "bump", "auditor", "horizon"]
};
