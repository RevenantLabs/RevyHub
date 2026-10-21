import { ScanSearch } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {
  slug: "operation-result-xdr-decoder", title: "Operation Result XDR Decoder",
  description: "Decode a settled transaction's result XDR into explained operation outcomes.",
  character: "Read the verdict behind every operation.", category: "transactions", status: "beta", icon: ScanSearch,
  networks: ["testnet", "mainnet"], keywords: ["transaction", "result", "xdr", "operation", "fee bump"]
};
