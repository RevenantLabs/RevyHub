import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/strkey-corruption-locator/copy";

/**
 * Completed scan with nothing to suggest.
 * This is a status, not an error: the tool finished and no one-character edit validates.
 */
export function NoCandidatesNotice() {
  const message = errorCopy.no_candidates_found;

  return <StatusMessage type="info" title={message.title} description={message.description} />;
}
