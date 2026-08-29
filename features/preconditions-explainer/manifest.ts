import { CalendarClock } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "preconditions-explainer",
  title: "Transaction Preconditions Explainer",
  description:
    "Read a transaction's time bounds, ledger bounds, minimum sequence rules and extra signers, and check them against the current ledger.",
  character: "A patient gatekeeper reads the small print and says whether the door is open yet.",
  category: "transactions",
  status: "working",
  icon: CalendarClock,
  networks: ["testnet", "mainnet"],
  keywords: [
    "preconditions",
    "time bounds",
    "ledger bounds",
    "min sequence age",
    "min sequence ledger gap",
    "extra signers",
    "expired",
    "xdr"
  ]
};
