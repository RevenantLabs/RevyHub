import { ArrowLeftRight } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "txrep-converter",
  title: "SEP-0011 Txrep Converter",
  description: "Convert a pasted transaction envelope between base64 XDR and SEP-0011 Txrep text, entirely offline.",
  character: "A clerk who recompiles the text and hides it if the bytes do not come back the same.",
  category: "standards",
  status: "working",
  icon: ArrowLeftRight,
  networks: [],
  offline: true,
  keywords: ["sep-0011", "txrep", "xdr", "envelope", "offline"]
};
