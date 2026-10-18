import { Wrench } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {slug:"muxed-account-codec",title:"Muxed Account Encoder and Decoder",category:"keys",description:"Convert between an M address and its G account plus exact uint64 routing ID. Both refer to the same ledger account; the ID provides routing, not a separate balance.",character:"Inspect locally, keep exact values.",status:"beta",icon:Wrench,networks:[],offline:true,keywords:["muxed", "account", "codec"]};
