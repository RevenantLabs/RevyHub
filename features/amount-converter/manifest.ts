import { Calculator } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "amount-converter",
  title: "Stroop and Amount Converter",
  description:
    "Convert between stroops and seven-decimal display amounts in both directions using exact BigInt arithmetic.",
  character: "A careful cashier counts every stroop twice before handing back the change.",
  category: "payments",
  status: "working",
  icon: Calculator,
  networks: [],
  offline: true,
  keywords: ["stroops", "amount", "xlm", "convert", "decimals", "int64", "precision"]
};
