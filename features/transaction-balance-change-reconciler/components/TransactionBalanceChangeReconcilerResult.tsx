"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { BalanceDeltaTable } from "@/features/transaction-balance-change-reconciler/components/BalanceDeltaTable";
import { ResidualNotice } from "@/features/transaction-balance-change-reconciler/components/ResidualNotice";
import {
  copy,
  metaVariantLabels
} from "@/features/transaction-balance-change-reconciler/copy";
import { formatStroops } from "@/features/transaction-balance-change-reconciler/lib/format";
import type { TransactionBalanceChangeReconcilerResult } from "@/features/transaction-balance-change-reconciler/types";

export function TransactionBalanceChangeReconcilerResult({
  result
}: {
  result: TransactionBalanceChangeReconcilerResult;
}) {
  return (
    <div className="space-y-4">
      <ResidualNotice
        residuals={result.residuals}
        incompleteReasons={result.evidence.incompleteReasons}
        fullyReconciled={result.fullyReconciled}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.overviewTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelMetaVariant,
              value: metaVariantLabels[result.metaVariant]
            },
            {
              label: copy.labelFeeCharged,
              value:
                result.fee.feeCharged === null
                  ? "—"
                  : formatStroops(result.fee.feeCharged),
              mono: true
            },
            {
              label: copy.labelFeeSource,
              value: result.fee.feeSource ?? "—",
              mono: true
            },
            {
              label: copy.labelSponsored,
              value: result.fee.sponsored ? copy.sponsoredYes : copy.sponsoredNo
            },
            {
              label: copy.labelReconciled,
              value: result.fullyReconciled ? copy.reconciledYes : copy.reconciledNo
            },
            {
              label: copy.labelDeltaCount,
              value: String(result.deltas.length),
              mono: true
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.deltasTitle}</CardTitle>
        </CardHeader>
        <BalanceDeltaTable deltas={result.deltas} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.evidenceTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.evidenceEnvelope,
              value: result.evidence.hasEnvelope ? copy.evidencePresent : "—"
            },
            {
              label: copy.evidenceResult,
              value: result.evidence.hasResult ? copy.evidencePresent : "—"
            },
            {
              label: copy.evidenceMeta,
              value: result.evidence.hasMetadata ? copy.evidencePresent : "—"
            },
            {
              label: copy.evidenceBalanceEntries,
              value: String(result.evidence.balanceEntryCount),
              mono: true
            },
            {
              label: copy.evidenceSkipped,
              value: String(result.evidence.skippedNonBalanceEntries),
              mono: true
            }
          ]}
        />
      </Card>
    </div>
  );
}
