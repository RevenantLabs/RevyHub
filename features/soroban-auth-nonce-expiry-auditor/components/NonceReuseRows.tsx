import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "../copy";
import type { NonceReuse } from "../types";

/** One row per complete network/address/nonce identity that appears more than once. */
export function NonceReuseRows({ groups }: { groups: NonceReuse[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.reuseTitle}</CardTitle>
      </CardHeader>
      {groups.length ? (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li key={JSON.stringify([group.networkPassphrase, group.address, group.nonce])} className="break-all rounded border p-3">
              <p className="font-mono text-xs">{group.address}</p>
              <p className="text-xs">
                {copy.network}: <span className="font-mono">{group.networkPassphrase}</span>
              </p>
              <p>
                {copy.nonce}: <span className="font-mono">{group.nonce}</span>
              </p>
              <p>
                {copy.entries}: {group.entryIndices.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>{copy.noReuse}</p>
      )}
    </Card>
  );
}
