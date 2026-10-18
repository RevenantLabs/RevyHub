import { copy } from "../copy";
import { formatPolicy } from "../lib/format";
import type { Policy } from "../types";

export function PolicyRules({ policy }: { policy: Policy }) {
  return (
    <section>
      <h3>{copy.rulesTitle}</h3>
      <p>Amount {formatPolicy(policy)}</p>
      <p>{policy.destinations.length} destination{policy.destinations.length === 1 ? "" : "s"}</p>
      <p>{policy.passphrases.length} passphrase{policy.passphrases.length === 1 ? "" : "s"}</p>
      <p>{policy.callbackHosts.join(", ") || "no callback hosts"}</p>
    </section>
  );
}
