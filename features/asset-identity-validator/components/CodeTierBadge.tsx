import { Badge } from "@/core/ui/Badge";
import { formatTier } from "@/features/asset-identity-validator/lib/format";
import type { CodeTier } from "@/features/asset-identity-validator/types";

/** Shows the tier chosen from the code length. */
export function CodeTierBadge({ tier }: { tier: CodeTier }) {
  return <Badge tone="info">{formatTier(tier)}</Badge>;
}
