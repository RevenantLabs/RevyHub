import { BookOpen } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {slug:"ledger-lookup",title:"Ledger Lookup",description:"Resolve ledger close time, transaction counts, fees, reserves and protocol version.",character:"Find the ledger behind the timestamp.",category:"network",status:"beta",icon:BookOpen,networks:["testnet","mainnet"],keywords:["ledger","sequence","history","close time","protocol"]};
