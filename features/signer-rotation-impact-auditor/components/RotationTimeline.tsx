"use client";

import { Badge } from "@/core/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { changeLabels, copy, thresholdLabels } from "@/features/signer-rotation-impact-auditor/copy";
import {
  formatOptional,
  formatReachability,
  formatWeight,
  shortenKey
} from "@/features/signer-rotation-impact-auditor/lib/format";
import type {
  RotationStep,
  StepImpact
} from "@/features/signer-rotation-impact-auditor/types";

export function RotationTimeline({
  steps,
  impacts
}: {
  steps: RotationStep[];
  impacts: StepImpact[];
}) {
  const impactByStep = new Map(impacts.map((impact) => [impact.stepIndex, impact]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.timelineTitle}</CardTitle>
        <CardDescription>
          Each row is one operation in envelope order. Weights and thresholds are
          exact integers.
        </CardDescription>
      </CardHeader>

      <ol className="space-y-3">
        {steps.map((step) => {
          const impact = impactByStep.get(step.index);
          return (
            <li
              key={step.index}
              className="space-y-2 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-mono text-xs font-semibold text-[#172033]">
                  #{step.index} {step.operationType}
                </span>
                <Badge tone={step.appliesToSnapshot ? "success" : "muted"}>
                  {step.appliesToSnapshot ? copy.stepApplies : copy.stepSkipped}
                </Badge>
                {impact?.anyUnreachable ? <Badge tone="danger">Lockout</Badge> : null}
                {impact && impact.recovered.length > 0 ? (
                  <Badge tone="warning">Recovered</Badge>
                ) : null}
              </div>

              <p className="text-xs text-[#4e5c73]">
                {step.inheritedSource ? copy.inheritedSource : copy.explicitSource}:{" "}
                <span className="font-mono">{shortenKey(step.effectiveSource, 6, 6)}</span>
              </p>

              {step.changes.length > 0 ? (
                <ul className="space-y-1 text-xs text-[#172033]">
                  {step.changes.map((change, changeIndex) => (
                    <li key={`${step.index}-${changeIndex}`}>
                      <span className="font-semibold">{changeLabels[change.kind]}</span>
                      {change.target ? (
                        <>
                          {" "}
                          <span className="font-mono">{shortenKey(change.target, 4, 4)}</span>
                        </>
                      ) : null}
                      {": "}
                      {formatOptional(change.before)} → {formatOptional(change.after)}
                    </li>
                  ))}
                </ul>
              ) : null}

              {impact ? (
                <dl className="grid gap-1 sm:grid-cols-3">
                  {impact.reachability.map((entry) => (
                    <div key={entry.level}>
                      <dt className="text-xs font-bold text-[#4e5c73]">
                        {thresholdLabels[entry.level]}
                      </dt>
                      <dd className="font-mono text-xs text-[#172033]">
                        {formatReachability(entry)}
                        {entry.shortfall && entry.shortfall !== "0"
                          ? ` (−${formatWeight(entry.shortfall)})`
                          : ""}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
