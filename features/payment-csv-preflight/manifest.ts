import { FileSpreadsheet } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "payment-csv-preflight",
  title: "Payment CSV Import Preflight",
  description:
    "Check a payout CSV before anyone builds a transaction from it — every address, every amount to the stroop, exact totals per asset and duplicates flagged rather than dropped.",
  character: "A cautious clerk reads the whole payout list aloud before signing anything.",
  category: "payments",
  status: "working",
  icon: FileSpreadsheet,
  networks: [],
  offline: true,
  keywords: [
    "csv",
    "payments",
    "payout",
    "batch",
    "import",
    "validation",
    "duplicates",
    "totals"
  ]
};
