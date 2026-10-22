import { Radio } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = { slug: "horizon-stream-sampler", title: "Horizon Stream Sampler", description: "Capture a small, time-bounded sample of live Horizon transaction events.", character: "Tune in briefly; disconnect deliberately.", category: "network", status: "beta", icon: Radio, networks: ["testnet", "mainnet"], keywords: ["horizon", "sse", "stream", "transactions"] };
