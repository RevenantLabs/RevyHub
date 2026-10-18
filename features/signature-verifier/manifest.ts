import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "signature-verifier",
  title: "Ed25519 Signature Verifier",
  description: "Verify an Ed25519 signature locally without sending a key or message to a server.",
  character: "A quiet verifier that proves possession without custody.",
  category: "keys",
  status: "beta",
  icon: Sparkles,
  networks: [],
  keywords: ["signature", "ed25519", "offline"],
  offline: true
};
