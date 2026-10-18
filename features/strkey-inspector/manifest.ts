import { Wrench } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {slug:"strkey-inspector",title:"StrKey Type Inspector",category:"keys",description:"Identify supported public Stellar StrKeys and inspect raw bytes offline. Secret seeds are discarded before decoding.",character:"Inspect locally, keep exact values.",status:"beta",icon:Wrench,networks:[],offline:true,keywords:["strkey", "inspector"]};
