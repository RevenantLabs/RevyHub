import { Link } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "horizon-url-builder",
  title: "Horizon URL Builder",
  description:
    "Construct Horizon REST API URLs with proper query parameters, cursors, and filters — fully offline.",
  character: "Every API call starts with a URL — build yours with confidence.",
  category: "developer",
  status: "working",
  icon: Link,
  networks: ["testnet", "mainnet"],
  offline: true,
  keywords: ["horizon", "url", "api", "builder", "developer", "stellar"],
};
