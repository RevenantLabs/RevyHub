import { copy } from "../copy";
import type { EventRow } from "../types";

export function EventRows({ rows }: { rows: EventRow[] }) {
  if (!rows.length) return <p role="status">{copy.noRows}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.id} className="rounded border p-3">
          <p>{row.type} · ledger {row.ledger}</p>
          <p className="font-mono text-sm">{row.contractId}</p>
          <p>Topics: {row.topics.join(", ") || "none"}</p>
          <p>Value: {row.value || "none"}</p>
        </li>
      ))}
    </ul>
  );
}
