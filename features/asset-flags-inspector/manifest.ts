import { ShieldAlert } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "asset-flags-inspector",
  title: "Issuer Authorization Flags Inspector",
  description: "Check an account's authorization flags and see their consequences for asset holders.",
  character: "Before you buy a token, know if the issuer can freeze it or claw it back.",
  category: "assets",
  status: "beta",
  icon: ShieldAlert,
  networks: ["testnet", "mainnet"],
  keywords: ["authorization", "flags", "asset", "issuer", "trustline", "clawback", "freeze"]
};
