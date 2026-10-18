import { StatusMessage } from "@/core/ui/StatusMessage";
import { FeeBreakdown } from "@/features/transaction-fee-charge-audit/components/FeeBreakdown";
import { EnvelopeType } from "@/features/transaction-fee-charge-audit/components/EnvelopeType";
import { LedgerContext } from "@/features/transaction-fee-charge-audit/components/LedgerContext";
import { copy } from "@/features/transaction-fee-charge-audit/copy";
import type { TransactionFeeChargeAuditResult as AuditResult } from "@/features/transaction-fee-charge-audit/types";

export function TransactionFeeChargeAuditResult({ result }: { result: AuditResult }) {
  return (
    <div className="space-y-4">
      <StatusMessage type="info" title={copy.resultTitle} description={copy.historicalNote} />
      <FeeBreakdown fees={result.envelope.fees} />
      <EnvelopeType
        envelope={result.envelope}
        operationCount={result.operationCount}
        hash={result.hash}
      />
      <LedgerContext ledger={result.ledger} network={result.network} />
    </div>
  );
}
