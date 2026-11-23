import { Timer } from "lucide-react"
import type { FeatureManifest } from "@/core/registry/types"

export const manifest: FeatureManifest = {
  slug: "sep38-quote-expiry-auditor",
  title: "SEP-38 Quote Expiry and Terms Auditor",
  description:
    "Checks a pasted firm quote for expiry at an explicit time and lists the declared trade terms without requesting or accepting the quote.",
  character: "A clerk stamps the quote's clock and reads every fee aloud, then puts the stamp away.",
  category: "standards",
  status: "working",
  icon: Timer,
  networks: [],
  offline: true,
  keywords: ["sep-38", "sep38", "quote", "expiry", "anchor", "fee"]
}
