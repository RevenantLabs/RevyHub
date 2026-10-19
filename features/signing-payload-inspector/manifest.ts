import { Fingerprint } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "signing-payload-inspector",
  title: "Transaction Signing Payload Inspector",
  description: "Inspect the exact signature base and hash for a classic or fee-bump transaction envelope.",
  character: "A patient cryptographer shows every byte before the signature is made.",
  category: "developer",
  status: "working",
  icon: Fingerprint,
  networks: [],
  offline: true,
  keywords: ["signature base", "signing payload", "network id", "fee bump", "xdr", "hash"]
};
