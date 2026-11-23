"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy, errorTitleFor } from "@/features/contract-upgrade-diff-report/copy";
import { useContractUpgradeDiffReport } from "@/features/contract-upgrade-diff-report/hooks/useContractUpgradeDiffReport";
import { ContractUpgradeDiffReportForm } from "@/features/contract-upgrade-diff-report/components/ContractUpgradeDiffReportForm";
import { ContractUpgradeDiffReportResult } from "@/features/contract-upgrade-diff-report/components/ContractUpgradeDiffReportResult";
import { ContractUpgradeDiffReportEmptyState } from "@/features/contract-upgrade-diff-report/components/ContractUpgradeDiffReportEmptyState";

export function ContractUpgradeDiffReportPanel() {
  const { state, submit, reset } = useContractUpgradeDiffReport();

  return (
    <div className="space-y-5">
      <Card>
        <ContractUpgradeDiffReportForm
          onSubmit={submit}
          onReset={reset}
          pending={state.status === "loading"}
          invalidSide={state.status === "error" ? state.side : undefined}
        />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <StatusMessage type="info" title={copy.loadingTitle} description={copy.loadingDescription} />
          <SkeletonRows rows={4} className="mt-4" />
        </Card>
      ) : null}

      {/* The error is announced once, here; the form only marks the field invalid. */}
      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorTitleFor(state.code, state.side)}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <ContractUpgradeDiffReportResult report={state.report} /> : null}

      {state.status === "idle" ? <ContractUpgradeDiffReportEmptyState /> : null}
    </div>
  );
}
