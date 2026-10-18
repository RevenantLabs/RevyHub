import { Search } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "transaction-lookup",
  title: "Transaction Lookup",
  description:
    "Look up a transaction by hash and read its ledger, fee, memo, result code and operation list.",
  character: "A detective comet follows a transaction hash back through the ledger.",
  category: "transactions",
  status: "working",
  icon: Search,
  networks: ["testnet", "mainnet"],
  keywords: ["transaction", "hash", "horizon", "ledger", "fee", "memo", "operations"]
};
