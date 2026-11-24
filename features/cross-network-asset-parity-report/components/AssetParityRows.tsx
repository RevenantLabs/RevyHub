import { DataList } from "@/core/ui/DataList"
import { formatDiff } from "@/features/cross-network-asset-parity-report/lib/format"
import type { FieldDiff } from "@/features/cross-network-asset-parity-report/types"

export function AssetParityRows({ diffs }: { diffs: FieldDiff[] }) {
  return (
    <DataList
      items={diffs.map((diff) => ({
        label: diff.field,
        value: `${formatDiff(diff)} · left ${diff.left} · right ${diff.right}`,
        mono: diff.field === "issuer"
      }))}
    />
  )
}
