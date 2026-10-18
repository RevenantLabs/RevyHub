import { Wrench } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {slug:"ledger-range-planner",title:"Ledger Range and Retention Planner",category:"network",description:"Split an inclusive ledger range into bounded chunks. Retention is a supplied assumption, not live provider state. Choose explicitly whether to export the requested range or only its retained intersection.",character:"Inspect locally, keep exact values.",status:"beta",icon:Wrench,networks:[],offline:true,keywords:["ledger", "range", "planner"]};
