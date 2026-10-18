import { Braces } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "contract-call-argument-checker",
  title: "Contract Call Argument Checker",
  description: "Check pasted Soroban arguments against one function in a contract spec without building a transaction.",
  character: "A typesetter who compares the mould with the metal before anything is struck.",
  category: "soroban",
  status: "beta",
  icon: Braces,
  networks: [],
  offline: true,
  keywords: ["soroban", "spec", "scval", "arguments", "xdr"]
};
