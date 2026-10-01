import { KeyRound } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "testnet-keypair-generator",
  title: "Testnet Keypair Generator",
  description:
    "Generate safe testnet keypairs with clear export and security guidance.",
  character:
    "A vigilant forge hand strikes fresh testnet keys with strict safety bounds.",
  category: "keys",
  status: "working",
  icon: KeyRound,
  networks: ["testnet"],
  keywords: [
    "testnet",
    "keypair",
    "generator",
    "keys",
    "secret",
    "public key",
    "ed25519",
    "friendbot",
    "export"
  ]
};
