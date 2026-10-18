import { Fingerprint } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "signature-hint-auditor",
  title: "Transaction Signature Hint Auditor",
  description:
    "Decode a pasted transaction envelope offline, list every decorated signature hint, and map optional public keys to hint-match candidates — never verified signatures.",
  character:
    "A careful clerk reads only the four-byte claim on each seal and never mistakes a matching mark for proof the letter is genuine.",
  category: "transactions",
  status: "working",
  icon: Fingerprint,
  networks: [],
  offline: true,
  keywords: [
    "signature",
    "hint",
    "decorated signature",
    "envelope",
    "xdr",
    "multisig",
    "fee bump",
    "collision",
    "offline"
  ]
};
