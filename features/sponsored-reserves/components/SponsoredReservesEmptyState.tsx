import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/sponsored-reserves/copy";

export function SponsoredReservesEmptyState() {
  return (
    <StatusMessage
      type="info"
      title={copy.title}
      description={copy.description}
    />
  );
}
