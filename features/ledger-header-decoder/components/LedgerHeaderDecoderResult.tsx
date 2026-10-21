import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/ledger-header-decoder/copy";
import { HeaderFieldRows } from "@/features/ledger-header-decoder/components/HeaderFieldRows";
import { ScpValueSummary } from "@/features/ledger-header-decoder/components/ScpValueSummary";
import { UpgradesList } from "@/features/ledger-header-decoder/components/UpgradesList";
import type { LedgerHeaderDecoderResult as ResultValue } from "@/features/ledger-header-decoder/types";

export function LedgerHeaderDecoderResult({ result }: { result: ResultValue }) {
  return <div className="space-y-4">
    <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader><HeaderFieldRows result={result} /></Card>
    <ScpValueSummary value={result.scpValue} />
    <UpgradesList upgrades={result.scpValue.upgrades} />
  </div>;
}
