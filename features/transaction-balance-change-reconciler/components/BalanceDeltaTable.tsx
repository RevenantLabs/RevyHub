import { copy } from "@/features/transaction-balance-change-reconciler/copy";
import {
  formatAccountId,
  formatAssetRef,
  formatSignedStroops,
  formatStroops,
  sortDeltas
} from "@/features/transaction-balance-change-reconciler/lib/format";
import type { BalanceDelta } from "@/features/transaction-balance-change-reconciler/types";

export function BalanceDeltaTable({ deltas }: { deltas: readonly BalanceDelta[] }) {
  const rows = sortDeltas(deltas);

  if (rows.length === 0) {
    return (
      <p className="text-sm leading-6 text-[#4e5c73]">
        {copy.noDeltasDescription}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#e3ebf5] text-xs font-bold uppercase tracking-wide text-[#4e5c73]">
            <th scope="col" className="px-2 py-2">
              {copy.columnAccount}
            </th>
            <th scope="col" className="px-2 py-2">
              {copy.columnAsset}
            </th>
            <th scope="col" className="px-2 py-2">
              {copy.columnBefore}
            </th>
            <th scope="col" className="px-2 py-2">
              {copy.columnAfter}
            </th>
            <th scope="col" className="px-2 py-2">
              {copy.columnDelta}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.accountId}:${formatAssetRef(row.asset)}`}
              className="border-b border-[#eef3f9]"
            >
              <td className="px-2 py-2 font-mono text-xs text-[#172033]" title={row.accountId}>
                {formatAccountId(row.accountId)}
              </td>
              <td className="px-2 py-2 font-mono text-xs text-[#172033]">
                {formatAssetRef(row.asset)}
              </td>
              <td className="px-2 py-2 font-mono text-xs text-[#4e5c73]">
                {formatStroops(row.before)}
              </td>
              <td className="px-2 py-2 font-mono text-xs text-[#4e5c73]">
                {formatStroops(row.after)}
              </td>
              <td className="px-2 py-2 font-mono text-xs font-semibold text-[#172033]">
                {formatSignedStroops(row.delta)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
