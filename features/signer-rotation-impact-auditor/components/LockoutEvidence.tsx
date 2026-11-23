"use client";

import { StatusMessage } from "@/core/ui/StatusMessage";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy, thresholdLabels } from "@/features/signer-rotation-impact-auditor/copy";
import {
  formatOptional,
  formatWeight
} from "@/features/signer-rotation-impact-auditor/lib/format";
import type {
  LockoutReport,
  ThresholdReachability
} from "@/features/signer-rotation-impact-auditor/types";

export function LockoutEvidence({
  lockout,
  finalReachability,
  evidenceComplete
}: {
  lockout: LockoutReport;
  finalReachability: ThresholdReachability[];
  evidenceComplete: boolean;
}) {
  if (!evidenceComplete) {
    return (
      <StatusMessage
        type="warning"
        title={copy.incompleteTitle}
        description={copy.incompleteDescription}
      />
    );
  }

  let status: {
    type: "success" | "warning" | "error" | "info";
    title: string;
    description: string;
  };

  if (lockout.recoveredFinal) {
    status = {
      type: "warning",
      title: copy.recoveredTitle,
      description: copy.recoveredDescription
    };
  } else if (lockout.finalLockout) {
    status = {
      type: "error",
      title: copy.finalLockoutTitle,
      description: copy.finalLockoutDescription
    };
  } else if (lockout.intermediateLockout) {
    status = {
      type: "warning",
      title: copy.intermediateLockoutTitle,
      description: copy.intermediateLockoutDescription
    };
  } else {
    status = {
      type: "success",
      title: copy.noLockoutTitle,
      description: copy.noLockoutDescription
    };
  }

  const unreachable = finalReachability.filter((entry) => entry.reachable === false);

  return (
    <div className="space-y-4">
      <StatusMessage
        type={status.type}
        title={status.title}
        description={status.description}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.lockoutTitle}</CardTitle>
          <CardDescription>
            Exact integer shortfalls for thresholds that cannot be met.
          </CardDescription>
        </CardHeader>

        <DataList
          items={[
            {
              label: copy.firstLockingLabel,
              value:
                lockout.firstLockingStepIndex === null
                  ? copy.unavailable
                  : `#${lockout.firstLockingStepIndex}`
            },
            {
              label: copy.lockedLevelsLabel,
              value:
                lockout.lockedLevelsFinal.length === 0
                  ? "—"
                  : lockout.lockedLevelsFinal.map((level) => thresholdLabels[level]).join(", ")
            }
          ]}
        />

        {unreachable.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {unreachable.map((entry) => (
              <li
                key={entry.level}
                className="rounded-md border border-[#f0d9d6] bg-[#fff7f6] px-3 py-2"
              >
                <p className="font-semibold text-[#9f342d]">
                  {thresholdLabels[entry.level]} — {copy.shortfallLabel}{" "}
                  {formatWeight(entry.shortfall)}
                </p>
                <p className="text-xs text-[#4e5c73]">
                  {copy.requiredLabel} {formatOptional(entry.required)} · {copy.availableLabel}{" "}
                  {formatOptional(entry.available)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}
