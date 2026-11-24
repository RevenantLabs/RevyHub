import { Card, CardHeader, CardTitle } from "@/core/ui/Card"
import { StatusMessage } from "@/core/ui/StatusMessage"
import { AssetParityRows } from "@/features/cross-network-asset-parity-report/components/AssetParityRows"
import { NetworkEvidenceCoverage } from "@/features/cross-network-asset-parity-report/components/NetworkEvidenceCoverage"
import { copy } from "@/features/cross-network-asset-parity-report/copy"
import type { ParityResult } from "@/features/cross-network-asset-parity-report/types"

export function CrossNetworkAssetParityReportResult({ result }: { result: ParityResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      {result.partial ? (
        <StatusMessage type="warning" title={copy.partialTitle} description={copy.partialDescription} />
      ) : null}
      {result.pairs.map((pair) => (
        <section key={pair.id} aria-label={pair.id}>
          <h3 className="mt-4 text-sm font-extrabold text-[#172033]">{pair.id}</h3>
          <AssetParityRows diffs={pair.diffs} />
          <NetworkEvidenceCoverage label="Left" side={pair.left} />
          <NetworkEvidenceCoverage label="Right" side={pair.right} />
        </section>
      ))}
    </Card>
  )
}
