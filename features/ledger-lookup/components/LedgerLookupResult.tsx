import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList, type DataListItem } from "@/core/ui/DataList";
import { copy } from "@/features/ledger-lookup/copy";
import {
  formatAmount,
  formatInteger,
  formatRelativeAge,
  formatStroops,
  formatTimestamp
} from "@/features/ledger-lookup/lib/format";
import type { LedgerSummary } from "@/features/ledger-lookup/types";

/** Renders a full inspection summary for a resolved Stellar ledger. */
export function LedgerLookupResult({ ledger }: { ledger: LedgerSummary }) {
  const items: DataListItem[] = [
    {
      label: "Sequence",
      value: `#${formatInteger(ledger.sequence)}`
    },
    {
      label: copy.protocolVersionLabel,
      value: String(ledger.protocolVersion)
    },
    {
      label: copy.closeTimeLabel,
      value: formatTimestamp(ledger.closedAt)
    },
    {
      label: copy.ageLabel,
      value: formatRelativeAge(ledger.closedAt)
    },
    {
      label: copy.successfulTxLabel,
      value: formatInteger(ledger.successfulTransactionCount)
    },
    {
      label: copy.failedTxLabel,
      value: formatInteger(ledger.failedTransactionCount)
    },
    {
      label: copy.operationsLabel,
      value: formatInteger(ledger.operationCount)
    }
  ];

  if (ledger.txSetOperationCount !== null) {
    items.push({
      label: copy.txSetOperationsLabel,
      value: formatInteger(ledger.txSetOperationCount)
    });
  }

  items.push(
    {
      label: copy.totalCoinsLabel,
      value: `${formatAmount(ledger.totalCoins)} XLM`
    },
    {
      label: copy.feePoolLabel,
      value: `${formatAmount(ledger.feePool)} XLM`
    },
    {
      label: copy.baseFeeLabel,
      value: formatStroops(ledger.baseFeeInStroops)
    },
    {
      label: copy.baseReserveLabel,
      value: formatStroops(ledger.baseReserveInStroops)
    },
    {
      label: copy.maxTxSetSizeLabel,
      value: formatInteger(ledger.maxTxSetSize)
    },
    {
      label: copy.hashLabel,
      value: <CopyableValue label="hash" value={ledger.hash} visible={8} />
    },
    {
      label: copy.prevHashLabel,
      value: <CopyableValue label="previous hash" value={ledger.prevHash} visible={8} />
    }
  );

  if (ledger.headerXdr) {
    items.push({
      label: "Header XDR",
      value: <CopyableValue label="header XDR" value={ledger.headerXdr} visible={12} />
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={items} />
    </Card>
  );
}
