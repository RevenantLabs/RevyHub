import { BadgeCheck } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "trustline-checker",
  title: "Trustline Checker",
  description:
    "Check whether an account trusts a specific issued asset, and report the trust limit and authorization flags.",
  character: "A tiny inspector looks for the handshake between an account and an asset.",
  category: "assets",
  status: "working",
  icon: BadgeCheck,
  networks: ["testnet", "mainnet"],
  keywords: ["trustline", "asset", "issuer", "limit", "authorization", "sep-41"]
};
