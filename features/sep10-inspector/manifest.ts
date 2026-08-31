import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sep10-inspector",
  title: "SEP-10 Challenge Transaction Inspector",
  description: "Inspect a SEP-10 challenge transaction offline without contacting Horizon or verifying TOML.",
  character: "A precise envelope reader checks every challenge invariant.",
  category: "standards",
  status: "beta",
  icon: Sparkles,
  networks: [],
  offline: true,
  keywords: ["sep10", "challenge", "xdr", "offline"]
};
