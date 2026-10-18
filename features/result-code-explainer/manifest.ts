import { BookOpenCheck } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "result-code-explainer",
  title: "Transaction Result Code Explainer",
  description:
    "Look up Stellar transaction and operation result codes in plain English, or paste a result XDR to decode every code it contains.",
  character: "A patient clerk translates ledger verdicts into causes and fixes, without calling Horizon.",
  category: "transactions",
  status: "working",
  icon: BookOpenCheck,
  networks: [],
  offline: true,
  keywords: [
    "result code",
    "tx_failed",
    "op_underfunded",
    "payment_underfunded",
    "transaction result",
    "xdr",
    "decode",
    "explain"
  ]
};
