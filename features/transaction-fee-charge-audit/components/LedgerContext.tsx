import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/transaction-fee-charge-audit/copy";
import {
  formatBaseFee,
  formatLedgerSequence,
  formatNetwork,
  formatTimestamp
} from "@/features/transaction-fee-charge-audit/lib/format";
import type { LedgerContextData } from "@/features/transaction-fee-charge-audit/types";
import type { StellarNetwork } from "@/core/network/types";

export function LedgerContext({
  ledger,
  network
}: {
  ledger: LedgerContextData;
  network: StellarNetwork;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.ledgerTitle}</CardTitle>
        <CardDescription>{copy.ledgerDescription}</CardDescription>
      </CardHeader>
      <DataList
        items={[
          { label: copy.labelLedger, value: formatLedgerSequence(ledger.sequence), mono: true },
          { label: copy.labelClosedAt, value: formatTimestamp(ledger.closedAt) },
          { label: copy.labelBaseFee, value: formatBaseFee(ledger.baseFeeInStroops), mono: true },
          { label: copy.labelNetwork, value: formatNetwork(network) }
        ]}
      />
    </Card>
  );
}
