import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/strkey-corruption-locator/copy";

/**
 * Rejection for a secret-seed version byte.
 * The component takes no value prop, so the seed cannot be rendered from this branch.
 */
export function SecretSeedGuard() {
  const message = errorCopy.contains_secret_seed;

  return <StatusMessage type="warning" title={message.title} description={message.description} />;
}
