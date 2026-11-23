import { ClipboardCheck } from "lucide-react"
import type { FeatureManifest } from "@/core/registry/types"

export const manifest: FeatureManifest = {
  slug: "sep31-field-readiness-checker",
  title: "SEP-31 Transfer Field Readiness Checker",
  description:
    "Checks a local, redacted field map against a recorded SEP-31 requirement document for one asset and one sender or receiver context.",
  character: "A clerk checks the form names against the list and never copies the answers into the file.",
  category: "standards",
  status: "working",
  icon: ClipboardCheck,
  networks: [],
  offline: true,
  keywords: ["sep-31", "sep31", "fields", "anchor", "sender", "receiver"]
}
