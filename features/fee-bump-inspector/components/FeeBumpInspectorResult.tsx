import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList, type DataListItem } from "@/core/ui/DataList";
import { copy } from "@/features/fee-bump-inspector/copy";
import {
  describeNetwork,
  formatFee,
  formatOperationType,
  formatSignatureCount,
  formatSignatureHints
} from "@/features/fee-bump-inspector/lib/format";
import type { AccountIdentity, FeeBumpReport } from "@/features/fee-bump-inspector/types";

/**
 * A muxed source contributes two extra rows rather than being flattened, so
 * the `M…` address the envelope carries and the `G…` account it resolves to
 * are both visible at once.
 */
function accountRows(label: string, identity: AccountIdentity): DataListItem[] {
  const rows: DataListItem[] = [
    { label, value: <CopyableValue label={label.toLowerCase()} value={identity.address} /> }
  ];

  if (identity.baseAddress) {
    rows.push({
      label: copy.labelBaseAccount,
      value: <CopyableValue label="underlying account" value={identity.baseAddress} />
    });
  }

  if (identity.muxedId) {
    rows.push({ label: copy.labelMuxedId, value: identity.muxedId, mono: true });
  }

  return rows;
}

export function FeeBumpInspectorResult({ report }: { report: FeeBumpReport }) {
  const { outer, inner, feeBid } = report;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.outerTitle}</CardTitle>
          <CardDescription>{copy.outerDescription}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            ...accountRows(copy.labelFeeSource, outer.feeSource),
            { label: copy.labelMaxFee, value: formatFee(outer.maxFee), mono: true },
            {
              label: copy.labelOuterHash,
              value: <CopyableValue label={copy.copyOuterHash} value={outer.hash} />
            },
            { label: copy.labelOuterSignatures, value: formatSignatureCount(outer.signatures) },
            {
              label: copy.labelSignatureHints,
              value: outer.signatures.count
                ? formatSignatureHints(outer.signatures)
                : copy.noSignatures,
              mono: outer.signatures.count > 0
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.innerTitle}</CardTitle>
          <CardDescription>{copy.innerDescription}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            ...accountRows(copy.labelInnerSource, inner.source),
            { label: copy.labelInnerSequence, value: inner.sequence, mono: true },
            { label: copy.labelInnerFee, value: formatFee(inner.fee), mono: true },
            { label: copy.labelOperationCount, value: String(inner.operationCount) },
            {
              label: copy.labelInnerHash,
              value: <CopyableValue label={copy.copyInnerHash} value={inner.hash} />
            },
            { label: copy.labelInnerSignatures, value: formatSignatureCount(inner.signatures) },
            {
              label: copy.labelSignatureHints,
              value: inner.signatures.count
                ? formatSignatureHints(inner.signatures)
                : copy.noSignatures,
              mono: inner.signatures.count > 0
            }
          ]}
        />
        <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.hashNote}</p>
        <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.signatureNote}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.feeBidTitle}</CardTitle>
          <CardDescription>{copy.feeBidExplainer}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelMaxFee, value: formatFee(feeBid.maxFee), mono: true },
            { label: copy.labelInnerFee, value: formatFee(feeBid.innerFee), mono: true },
            {
              label: copy.labelChargeableOperations,
              value: String(feeBid.chargeableOperations),
              mono: true
            },
            {
              label: copy.labelMaxFeePerOperation,
              value: formatFee(feeBid.maxFeePerOperation),
              mono: true
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.operationsTitle}</CardTitle>
        </CardHeader>
        {inner.operationTypes.length ? (
          <ol className="space-y-2">
            {inner.operationTypes.map((type, index) => (
              <li
                key={`${type}-${index}`}
                className="flex flex-wrap items-center gap-x-3 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs text-[#8a98aa]">#{index + 1}</span>
                <span className="font-semibold text-[#172033]">{formatOperationType(type)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm leading-6 text-[#4e5c73]">{copy.noOperations}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.networkTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelPassphrase,
              value: `${describeNetwork(report.networkPassphrase)} — ${report.networkPassphrase}`
            }
          ]}
        />
      </Card>
    </div>
  );
}
