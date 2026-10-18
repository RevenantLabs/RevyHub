import { Wrench } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {slug:"price-fraction-lab",title:"Stellar Price Fraction Workbench",category:"assets",description:"Convert positive decimal prices or exact fractions to Stellar Price bounds. Decimal previews truncate toward zero at your selected precision; an unrepresentable exact price is rejected.",character:"Inspect locally, keep exact values.",status:"beta",icon:Wrench,networks:[],offline:true,keywords:["price", "fraction", "lab"]};
