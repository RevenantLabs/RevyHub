import { ShieldCheck } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "address-validator",
  title: "Address Validator",
  description:
    "Validate Stellar public keys and explain exactly why an address is rejected, without ever accepting a secret key.",
  character: "A careful star clerk checks every public key badge before letting it through.",
  category: "keys",
  status: "working",
  icon: ShieldCheck,
  networks: [],
  offline: true,
  keywords: ["address", "public key", "strkey", "G...", "validate", "checksum", "ed25519"]
};
