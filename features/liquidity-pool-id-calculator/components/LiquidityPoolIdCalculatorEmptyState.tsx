import { Waves } from "lucide-react";
import { EmptyState } from "@/core/ui";
import { copy } from "../copy";

export function LiquidityPoolIdCalculatorEmptyState() {
  return <EmptyState icon={Waves} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
