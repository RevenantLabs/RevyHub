import { Waves } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/liquidity-pool-inspector/copy";

export function LiquidityPoolInspectorEmptyState() {
  return <EmptyState icon={Waves} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
