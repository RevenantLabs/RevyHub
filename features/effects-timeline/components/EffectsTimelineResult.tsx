import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { cn } from "@/core/lib/cn";
import { copy } from "@/features/effects-timeline/copy";
import { findMultiEffectExample } from "@/features/effects-timeline/lib/effectsTimeline";
import {
  formatEffectType,
  formatIdentifier,
  formatTimestamp
} from "@/features/effects-timeline/lib/format";
import type {
  EffectCategory,
  EffectsTimelinePage,
  TimelineEffect,
  TransactionGroup
} from "@/features/effects-timeline/types";

/**
 * Balance changes and configuration changes are told apart by a written badge
 * as well as by colour, because colour on its own carries no meaning for a
 * screen reader and none for a reader who cannot distinguish the two hues.
 */
const categoryStyles: Record<EffectCategory, string> = {
  balance: "border-l-[#70c7a7] bg-[#f2fbf7]",
  configuration: "border-l-[#c7b9f3] bg-[#f7f5ff]"
};

const categoryTones: Record<EffectCategory, "success" | "muted"> = {
  balance: "success",
  configuration: "muted"
};

function EffectItem({ effect }: { effect: TimelineEffect }) {
  return (
    <li
      className={cn(
        "rounded-md border border-[#e3ebf5] border-l-4 px-3 py-2",
        categoryStyles[effect.category]
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={categoryTones[effect.category]}>{copy.categoryLabels[effect.category]}</Badge>
        <span className="text-sm font-bold text-[#172033]">{formatEffectType(effect.type)}</span>
      </div>

      {effect.fields.length ? (
        <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {effect.fields.map((entry) => (
            <div key={entry.key} className="flex flex-wrap items-baseline gap-2">
              <dt className="text-xs font-bold uppercase tracking-wide text-[#4e5c73]">
                {copy.fieldLabels[entry.key]}
              </dt>
              <dd
                className={cn(
                  "min-w-0 break-words text-sm text-[#172033]",
                  entry.identifier && "font-mono text-xs"
                )}
                title={entry.identifier ? entry.value : undefined}
              >
                {entry.identifier ? formatIdentifier(entry.value) : entry.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </li>
  );
}

function TransactionCard({ group }: { group: TransactionGroup }) {
  return (
    <li>
      <Card>
        <CardHeader>
          <CardTitle>{copy.transactionHeading(group.ledger, group.transactionIndex)}</CardTitle>
          <CardDescription>
            {formatTimestamp(group.createdAt)} ·{" "}
            {copy.transactionMeta(group.effectCount, group.operations.length)}
          </CardDescription>
        </CardHeader>

        {group.continuedFromNewerPage ? (
          <p className="mb-3 rounded-md border border-[#82cbe3]/70 bg-[#e0f6ff] px-3 py-2 text-sm text-[#146783]">
            {copy.continuedFromNewerPage}
          </p>
        ) : null}

        <ol className="space-y-4" aria-label={copy.operationsLabel}>
          {group.operations.map((operation) => (
            <li key={operation.operationId}>
              <h3 className="text-sm font-extrabold text-[#172033]">
                {copy.operationHeading(operation.operationIndex)}
              </h3>
              <p className="mb-2 text-xs text-[#68758a]">
                {copy.operationMeta(operation.effects.length)}
              </p>
              <ol className="space-y-2" aria-label={copy.effectsLabel}>
                {operation.effects.map((effect) => (
                  <EffectItem key={effect.id} effect={effect} />
                ))}
              </ol>
            </li>
          ))}
        </ol>

        {group.continuesOnOlderPage ? (
          <p className="mt-3 rounded-md border border-[#82cbe3]/70 bg-[#e0f6ff] px-3 py-2 text-sm text-[#146783]">
            {copy.continuesOnOlderPage}
          </p>
        ) : null}
      </Card>
    </li>
  );
}

export function EffectsTimelineResult({ page }: { page: EffectsTimelinePage }) {
  const balanceEffects = page.groups.reduce((sum, group) => sum + group.balanceEffectCount, 0);
  const configurationEffects = page.groups.reduce(
    (sum, group) => sum + group.configurationEffectCount,
    0
  );
  const example = findMultiEffectExample(page.groups);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.accountLabel,
              value: <CopyableValue label={copy.accountLabel} value={page.accountId} />
            },
            { label: copy.effectsOnPageLabel, value: String(page.effectCount) },
            { label: copy.balanceEffectsLabel, value: String(balanceEffects) },
            { label: copy.configurationEffectsLabel, value: String(configurationEffects) },
            { label: copy.transactionsOnPageLabel, value: String(page.groups.length) }
          ]}
        />
      </Card>

      {page.effectCount === 0 ? (
        <StatusMessage
          type="info"
          title={copy.noEffectsTitle}
          description={copy.noEffectsDescription}
        />
      ) : (
        <>
          <StatusMessage
            type="info"
            title={copy.multiEffectTitle}
            description={
              <>
                <span>{copy.multiEffectDescription}</span>{" "}
                <span className="font-bold">
                  {example
                    ? copy.multiEffectExample(
                        example.effectCount,
                        example.ledger,
                        example.operationIndex
                      )
                    : copy.multiEffectNoExample}
                </span>
              </>
            }
          />

          <ol className="space-y-4" aria-label={copy.timelineLabel}>
            {page.groups.map((group) => (
              <TransactionCard key={group.transactionId} group={group} />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
