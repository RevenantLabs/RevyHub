import { PackagePlus } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "contract-deploy-preview",
  title: "Contract Deploy Preview",
  description:
    "Decode a pasted CreateContractV2 host function invocation and show its contract ID preimage source, executable and constructor arguments.",
  character: "A notary who reads the filing before anyone signs it.",
  category: "soroban",
  status: "beta",
  icon: PackagePlus,
  networks: [],
  offline: true,
  keywords: ["soroban", "create contract", "host function", "constructor", "preimage"]
};
