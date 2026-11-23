import { StatusMessage } from "@/core/ui/StatusMessage";
import {
  copy,
  incompleteReasonCopy
} from "@/features/transaction-balance-change-reconciler/copy";
import {
  formatAssetRef,
  formatSignedStroops,
  formatStroops
} from "@/features/transaction-balance-change-reconciler/lib/format";
import type {
  AssetResidual,
  IncompleteEvidenceReason
} from "@/features/transaction-balance-change-reconciler/types";

export function ResidualNotice({
  residuals,
  incompleteReasons,
  fullyReconciled
}: {
  residuals: readonly AssetResidual[];
  incompleteReasons: readonly IncompleteEvidenceReason[];
  fullyReconciled: boolean;
}) {
  return (
    <div className="space-y-4">
      {fullyReconciled ? (
        <StatusMessage
          type="success"
          title={copy.successTitle}
          description={copy.successDescription}
        />
      ) : (
        <StatusMessage
          type="warning"
          title={copy.incompleteTitle}
          description={copy.incompleteDescription}
        />
      )}

      {incompleteReasons.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-[#4e5c73]">
          {incompleteReasons.map((reason) => (
            <li key={reason}>{incompleteReasonCopy[reason]}</li>
          ))}
        </ul>
      ) : null}

      {residuals.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3ebf5] text-xs font-bold uppercase tracking-wide text-[#4e5c73]">
                <th scope="col" className="px-2 py-2">
                  {copy.residualAsset}
                </th>
                <th scope="col" className="px-2 py-2">
                  {copy.residualSummed}
                </th>
                <th scope="col" className="px-2 py-2">
                  {copy.residualExpected}
                </th>
                <th scope="col" className="px-2 py-2">
                  {copy.residualValue}
                </th>
                <th scope="col" className="px-2 py-2">
                  {copy.residualStatus}
                </th>
              </tr>
            </thead>
            <tbody>
              {residuals.map((row) => (
                <tr
                  key={formatAssetRef(row.asset)}
                  className="border-b border-[#eef3f9]"
                >
                  <td className="px-2 py-2 font-mono text-xs text-[#172033]">
                    {formatAssetRef(row.asset)}
                  </td>
                  <td className="px-2 py-2 font-mono text-xs text-[#4e5c73]">
                    {formatSignedStroops(row.summedDelta)}
                  </td>
                  <td className="px-2 py-2 font-mono text-xs text-[#4e5c73]">
                    {row.expectedSum === null ? "—" : formatSignedStroops(row.expectedSum)}
                  </td>
                  <td className="px-2 py-2 font-mono text-xs font-semibold text-[#172033]">
                    {row.residual === null ? "—" : formatStroops(row.residual)}
                  </td>
                  <td className="px-2 py-2 text-xs text-[#4e5c73]">
                    {row.reconciled ? copy.residualOk : copy.residualOpen}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
