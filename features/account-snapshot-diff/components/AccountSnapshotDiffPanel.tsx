"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/account-snapshot-diff/copy";
import { useAccountSnapshotDiff } from "@/features/account-snapshot-diff/hooks/useAccountSnapshotDiff";
import { AccountSnapshotDiffForm } from "@/features/account-snapshot-diff/components/AccountSnapshotDiffForm";
import { AccountSnapshotDiffResult } from "@/features/account-snapshot-diff/components/AccountSnapshotDiffResult";
import { AccountSnapshotDiffEmptyState } from "@/features/account-snapshot-diff/components/AccountSnapshotDiffEmptyState";

export function AccountSnapshotDiffPanel() {
  const {
    state,
    section,
    setSection,
    changeFilter,
    setChangeFilter,
    visibleChanges,
    resetFilters,
    submit,
    redactions
  } = useAccountSnapshotDiff();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a secret key
          is refused, which is what actually clears it out of the field.
        */}
        <AccountSnapshotDiffForm key={redactions} onSubmit={submit} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <AccountSnapshotDiffResult
          diff={state.diff}
          section={section}
          onSectionChange={setSection}
          changeFilter={changeFilter}
          onChangeFilterChange={setChangeFilter}
          onResetFilters={resetFilters}
          visibleChanges={visibleChanges}
        />
      ) : null}

      {state.status === "idle" ? <AccountSnapshotDiffEmptyState /> : null}
    </div>
  );
}
