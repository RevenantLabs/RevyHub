import { StatusMessage } from "@/core/ui";
import { copy } from "../copy";

/** The "expired temporary entry" outcome is informative, not an error — see README. */
export function TemporaryExpiredNotice() {
  return <StatusMessage type="warning" title={copy.temporaryExpiredTitle} description={copy.temporaryExpiredDescription} />;
}
