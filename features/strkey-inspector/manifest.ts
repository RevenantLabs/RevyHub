import { KeyRound } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "strkey-inspector",
  title: "StrKey Type Inspector",
  description:
    "Inspect Stellar StrKey encodings, decode raw binary payloads to hex, and inspect multiplexed account components without exposing secret seeds.",
  character: "A cryptographic sentinel decodes StrKey version bytes and inspects binary payloads.",
  category: "keys",
  status: "beta",
  icon: KeyRound,
  networks: [],
  offline: true,
  keywords: ["strkey", "inspector", "ed25519", "muxed", "contract", "preauth", "hashx", "payload", "hex"]
};
