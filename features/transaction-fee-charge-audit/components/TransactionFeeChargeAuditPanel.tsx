"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTransactionFeeChargeAudit } from "@/features/transaction-fee-charge-audit/hooks/useTransactionFeeChargeAudit";
import { errorCopy } from "@/features/transaction-fee-charge-audit/copy";
import { TransactionFeeChargeAuditForm } from "@/features/transaction-fee-charge-audit/components/TransactionFeeChargeAuditForm";
import { TransactionFeeChargeAuditResult } from "@/features/transaction-fee-charge-audit/components/TransactionFeeChargeAuditResult";
import { TransactionFeeChargeAuditEmptyState } from "@/features/transaction-fee-charge-audit/components/TransactionFeeChargeAuditEmptyState";

export function TransactionFeeChargeAuditPanel() {
  const { state, submit } = useTransactionFeeChargeAudit();

  return (
    <div className="space-y-5">
      <Card>
        <TransactionFeeChargeAuditForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <TransactionFeeChargeAuditResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <TransactionFeeChargeAuditEmptyState /> : null}
    </div>
  );
}
