import { FileCode2 } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "ledger-header-decoder",
  title: "Ledger Header XDR Decoder",
  description: "Decode a pasted ledger header locally and inspect its protocol, fees, reserve and SCP value.",
  character: "An archivist reads the ledger header without contacting the network.",
  category: "network",
  status: "working",
  icon: FileCode2,
  networks: [],
  offline: true,
  keywords: ["ledger", "header", "xdr", "scp", "upgrade", "base fee", "base reserve"]
};
