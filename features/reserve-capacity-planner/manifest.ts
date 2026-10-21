import { Calculator } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "reserve-capacity-planner",
  title: "Reserve Capacity Planner",
  description:
    "Project the classic minimum XLM reserve for hypothetical trustlines, offers, data entries and signers.",
  character: "A careful fox sketches future subentries before locking a single lumen.",
  category: "developer",
  status: "beta",
  icon: Calculator,
  networks: [],
  offline: true,
  keywords: ["reserve", "minimum balance", "subentry", "base reserve", "xlm", "capacity", "planner"]
};
