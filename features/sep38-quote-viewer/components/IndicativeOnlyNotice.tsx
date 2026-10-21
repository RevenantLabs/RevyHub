import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/sep38-quote-viewer/copy";

/** The price below is informational. It is not a firm or bindable quote. */
export function IndicativeOnlyNotice() {
  return (
    <StatusMessage
      type="warning"
      title={copy.indicativeTitle}
      description={copy.indicativeDescription}
    />
  );
}
