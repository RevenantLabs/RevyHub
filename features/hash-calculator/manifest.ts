import { Wrench } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {slug:"hash-calculator",title:"Stellar Hash Calculator",category:"keys",description:"Hash UTF-8, hex or base64 bytes with SHA-256, or derive a transaction hash from envelope XDR and an explicit network passphrase. Changing the passphrase changes transaction hashes; recompute after each edit.",character:"Inspect locally, keep exact values.",status:"beta",icon:Wrench,networks:[],offline:true,keywords:["hash", "calculator"]};
