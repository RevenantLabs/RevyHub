import { copy } from "../copy";
import { assetLabel, formatAmount } from "../lib/format";
import type { MatrixRow } from "../types";
export function AssetTotals({ rows }: { rows: MatrixRow[] }) {
  if (!rows.length) return null;
  return <section aria-labelledby="asset-totals-title">
    <h3 id="asset-totals-title" className="mb-3 font-bold">{copy.totalsTitle}</h3>
    <ul className="space-y-2">{rows.map((row) => <li key={row.kind + row.code + row.issuer}
      className="flex flex-wrap gap-2 text-sm">
      <span>{assetLabel(row)}</span>
      {row.issuer && <span className="break-all font-mono">{row.issuer}</span>}
      <strong className="font-mono">{formatAmount(row.total)}</strong>
    </li>)}</ul>
  </section>;
}
