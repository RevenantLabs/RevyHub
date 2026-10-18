import { copy } from "../copy";
import { assetLabel, formatAmount } from "../lib/format";
import type { MultiAccountAssetExposureResult } from "../types";
export function ExposureMatrix({ result }: { result: MultiAccountAssetExposureResult }) {
  return <section aria-labelledby="exposure-matrix-title">
    <h3 id="exposure-matrix-title" className="mb-3 font-bold">{copy.matrixTitle}</h3>
    {!result.matrix.length ? <p>{copy.noAssets}</p> : <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">{copy.matrixTitle}</caption>
        <thead><tr className="border-b">
          <th scope="col" className="p-2">{copy.columnAsset}</th>
          <th scope="col" className="p-2">{copy.columnIssuer}</th>
          {result.accounts.map((account) => <th scope="col" key={account.accountId}
            className="max-w-36 break-all p-2 font-mono">{account.accountId}</th>)}
          <th scope="col" className="p-2">{copy.columnTotal}</th>
        </tr></thead>
        <tbody>{result.matrix.map((row) => <tr key={row.kind + row.code + row.issuer} className="border-b">
          <th scope="row" className="p-2">{assetLabel(row)}</th>
          <td className="max-w-36 break-all p-2 font-mono">{row.issuer || copy.nativeIssuer}</td>
          {row.balances.map((amount, index) => <td key={result.accounts[index].accountId}
            className="p-2 font-mono">{amount === null ? copy.missingBalance : formatAmount(amount)}</td>)}
          <td className="p-2 font-mono font-bold">{formatAmount(row.total)}</td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>;
}
