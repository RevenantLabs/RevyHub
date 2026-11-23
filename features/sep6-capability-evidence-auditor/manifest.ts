import { ShieldCheck } from "lucide-react"
import type { FeatureManifest } from "@/core/registry/types"

export const manifest: FeatureManifest = {
  slug: "sep6-capability-evidence-auditor",
  title: "SEP-6 Capability Evidence Auditor",
  description:
    "Reads a pasted SEP-6 /info response and shows each asset's deposit, withdraw, and exchange declarations without filling in absent fields.",
  character: "A clerk ticks only the boxes the anchor actually printed, and leaves the blank ones blank.",
  category: "standards",
  status: "working",
  icon: ShieldCheck,
  networks: [],
  offline: true,
  keywords: ["sep-6", "sep6", "deposit", "withdraw", "anchor", "info"]
}
