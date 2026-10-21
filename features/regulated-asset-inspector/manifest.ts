import { ShieldAlert } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "regulated-asset-inspector",
  title: "SEP-8 Regulated Asset Inspector",
  description:
    "Read an issuer stellar.toml and show whether one asset is published as SEP-8 regulated, including its approval server and criteria.",
  character: "A clerk who reads the issuer's own notice and refuses to treat it as a verdict.",
  category: "standards",
  status: "working",
  icon: ShieldAlert,
  networks: ["testnet", "mainnet"],
  keywords: ["sep-8", "regulated", "approval server", "stellar.toml", "currencies"]
};
