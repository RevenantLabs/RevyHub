"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAccountOffersInspector } from "@/features/account-offers-inspector/hooks/useAccountOffersInspector";
import { copy, errorCopy } from "@/features/account-offers-inspector/copy";
import { AccountOffersInspectorForm } from "@/features/account-offers-inspector/components/AccountOffersInspectorForm";
import { AccountOffersInspectorResult } from "@/features/account-offers-inspector/components/AccountOffersInspectorResult";
import { AccountOffersInspectorEmptyState } from "@/features/account-offers-inspector/components/AccountOffersInspectorEmptyState";

export function AccountOffersInspectorPanel() {
  const { state, submit } = useAccountOffersInspector();

  return (
    <div className="space-y-5">
      <Card>
        <AccountOffersInspectorForm onSubmit={submit} loading={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <AccountOffersInspectorResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <AccountOffersInspectorEmptyState /> : null}
    </div>
  );
}
