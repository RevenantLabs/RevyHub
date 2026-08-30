import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/result-code-explainer/copy";
import {
  formatCategory,
  formatCodeLabel,
  formatFeeCharged,
  formatOperationHeading
} from "@/features/result-code-explainer/lib/format";
import type {
  CodeExplanation,
  ResultCodeExplainerResult as ResultCodeExplainerResultValue
} from "@/features/result-code-explainer/types";

function ExplanationCard({ entry }: { entry: CodeExplanation }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{entry.title}</CardTitle>
        <CardDescription className="font-mono text-xs">{formatCodeLabel(entry)}</CardDescription>
      </CardHeader>
      <DataList
        items={[
          { label: copy.labelCategory, value: formatCategory(entry.category) },
          { label: copy.labelCause, value: entry.cause },
          { label: copy.labelFix, value: entry.fix }
        ]}
      />
      {!entry.known ? (
        <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.unknownNote}</p>
      ) : null}
    </Card>
  );
}

export function ResultCodeExplainerResult({ result }: { result: ResultCodeExplainerResultValue }) {
  const hasFilter = result.searchQuery.length > 0;
  const showEmptyFilter = hasFilter && result.explanations.length === 0;

  return (
    <div className="space-y-4">
      {showEmptyFilter ? (
        <StatusMessage type="warning" title={copy.noMatches} description={copy.searchHint} />
      ) : null}

      {result.mode === "xdr" && result.transactionCode ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.transactionTitle}</CardTitle>
          </CardHeader>
          <DataList
            items={[
              ...(result.feeCharged
                ? [{ label: copy.labelFee, value: formatFeeCharged(result.feeCharged), mono: true }]
                : []),
              {
                label: copy.labelTransactionCode,
                value: result.transactionCode,
                mono: true
              }
            ]}
          />
        </Card>
      ) : null}

      {result.transactionExplanation ? (
        <ExplanationCard entry={result.transactionExplanation} />
      ) : null}

      {result.operations.length ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#172033]">{copy.operationsTitle}</h3>
          {result.operations.map((op) => (
            <div key={op.index} className="space-y-3">
              <p className="text-sm font-medium text-[#4e5c73]">
                {formatOperationHeading(op.index, op.operationType)}
              </p>
              <DataList
                items={[
                  { label: copy.labelOuterCode, value: op.outerCode, mono: true },
                  ...(op.innerCode
                    ? [{ label: copy.labelInnerCode, value: op.innerCode, mono: true }]
                    : [])
                ]}
              />
              {op.explanations.map((entry) => (
                <ExplanationCard key={`${op.index}-${entry.code}`} entry={entry} />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {result.mode === "code" && result.explanations.length ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#172033]">{copy.referenceTitle}</h3>
          {result.explanations.map((entry) => (
            <ExplanationCard key={entry.code} entry={entry} />
          ))}
        </div>
      ) : null}

      {result.mode === "xdr" && result.explanations.length && !result.operations.length ? (
        <div className="space-y-3">
          {result.explanations.map((entry) => (
            <ExplanationCard key={entry.code} entry={entry} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
