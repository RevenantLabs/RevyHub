import { GitCompare } from "lucide-react"
import type { FeatureManifest } from "@/core/registry/types"

export const manifest: FeatureManifest = {
  slug: "cross-network-asset-parity-report",
  title: "Cross-Network Asset Metadata Parity Report",
  description:
    "Compares issuer flags, home domains, and asset identity for pairs you define on testnet and mainnet. It does not compare prices or invent issuer mappings.",
  character: "A clerk holds two ledger cards side by side and only marks the fields both cards actually show.",
  category: "assets",
  status: "working",
  icon: GitCompare,
  networks: ["testnet", "mainnet"],
  keywords: ["asset", "issuer", "home domain", "testnet", "mainnet", "parity"]
}
