import { KeyRound } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-signers",
  title: "Account Signers and Thresholds",
  description:
    "Inspect every account signer, its weight, and the operation thresholds those weights must meet.",
  character: "A careful fox weighs every key before opening the account vault.",
  category: "accounts",
  status: "working",
  icon: KeyRound,
  networks: ["testnet", "mainnet"],
  keywords: ["account", "signers", "thresholds", "multisig", "weights", "horizon"]
};
