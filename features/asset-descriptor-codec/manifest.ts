import { Wallet } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "asset-descriptor-codec",
  title: "Classic Asset Descriptor and XDR Codec",
  description:
    "Convert native and issued asset descriptors to canonical text, structured JSON, and Asset XDR — and decode XDR back. Fully offline.",
  character: "Every asset tells three stories: a name, a structure, and bytes on the wire.",
  category: "assets",
  status: "working",
  icon: Wallet,
  networks: [],
  offline: true,
  keywords: ["asset", "xdr", "codec", "descriptor", "native", "issuer", "stellar"],
};
