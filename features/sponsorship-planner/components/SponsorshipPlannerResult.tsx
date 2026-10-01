import { ListChecks, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/sponsorship-planner/copy";
import {
  formatStroops,
  reserveCostStroops,
  reserveUnitsLabel
} from "@/features/sponsorship-planner/lib/format";
import type {
  PlannedEntry,
  SponsorshipPlannerResult as SponsorshipPlannerResultValue
} from "@/features/sponsorship-planner/types";

function entryCost(entry: PlannedEntry, baseReserveStroops: string): string {
  return formatStroops(reserveCostStroops(entry.reserveUnits, baseReserveStroops));
}

export function SponsorshipPlannerResult({ data }: { data: SponsorshipPlannerResultValue }) {
  const hasShortfall = BigInt(data.sponsorShortfallStroops) > 0n;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.sponsorLabel,
              value: (
                <CopyableValue label={copy.sponsorLabel} value={data.sponsorAccountId} visible={4} />
              ),
              mono: true
            },
            {
              label: copy.sponsoredLabel,
              value: (
                <CopyableValue
                  label={copy.sponsoredLabel}
                  value={data.sponsoredAccountId}
                  visible={4}
                />
              ),
              mono: true
            },
            {
              label: copy.baseReserveLabel,
              value: formatStroops(data.baseReserveStroops)
            },
            {
              label: copy.plannedCostLabel,
              value: `${formatStroops(data.plannedCostStroops)} (${reserveUnitsLabel(data.plannedUnits)})`
            },
            {
              label: copy.sponsoredStillNeedsLabel,
              value: formatStroops(data.sponsoredStillNeedsStroops)
            }
          ]}
        />
      </Card>

      {data.plannedEntries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.plannedSubentriesTitle}</CardTitle>
            <CardDescription>
              {data.sponsoredAccountExists
                ? copy.plannedSubentriesDescription
                : copy.newAccountNote}
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">{copy.accountSectionLabel(data.sponsoredAccountId)}</caption>
              <thead>
                <tr className="border-b border-[#e3ebf5]">
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnKind}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnEntry}
                  </th>
                  <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                    {copy.columnCost}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.plannedEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#f0f4f9] last:border-0">
                    <td className="py-3 pr-4 font-semibold text-[#172033]">
                      {copy.entryKinds[entry.kind]}
                    </td>
                    <th
                      scope="row"
                      className="max-w-xs break-all py-3 pr-4 font-mono text-xs font-medium text-[#172033]"
                    >
                      {entry.kind === "account" ? data.sponsoredAccountId : entry.reference}
                    </th>
                    <td className="py-3 text-[#172033]">{entryCost(entry, data.baseReserveStroops)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title={copy.allSponsoredTitle}
          description={copy.allSponsoredDescription}
        />
      )}

      {data.alreadySponsoredEntries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.alreadySponsoredTitle}</CardTitle>
            <CardDescription>{copy.alreadySponsoredDescription}</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">{copy.alreadySponsoredTitle}</caption>
              <thead>
                <tr className="border-b border-[#e3ebf5]">
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnKind}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnEntry}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnCost}
                  </th>
                  <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                    {copy.columnSponsor}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.alreadySponsoredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#f0f4f9] last:border-0">
                    <td className="py-3 pr-4 font-semibold text-[#172033]">
                      {copy.entryKinds[entry.kind]}
                    </td>
                    <th
                      scope="row"
                      className="max-w-xs break-all py-3 pr-4 font-mono text-xs font-medium text-[#172033]"
                    >
                      {entry.kind === "account" ? data.sponsoredAccountId : entry.reference}
                    </th>
                    <td className="py-3 pr-4 text-[#172033]">
                      {entryCost(entry, data.baseReserveStroops)}
                    </td>
                    <td className="py-3">
                      <CopyableValue
                        label={copy.copySponsorLabel(entry.reference)}
                        value={entry.existingSponsor ?? ""}
                        visible={4}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{copy.sponsorSectionTitle}</CardTitle>
            <CardDescription>{copy.sponsorSectionDescription}</CardDescription>
          </CardHeader>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Stat label={copy.sponsorBalanceLabel} value={formatStroops(data.sponsorBalanceStroops)} />
            <Stat
              label={copy.sponsorCurrentLabel}
              value={formatStroops(data.sponsorCurrentMinimumStroops)}
            />
            <Stat
              label={copy.sponsorResultingLabel}
              value={formatStroops(data.sponsorResultingMinimumStroops)}
              emphasize
            />
            <Stat
              label={hasShortfall ? copy.sponsorShortfallLabel : copy.sponsorCoveredLabel}
              value={hasShortfall ? formatStroops(data.sponsorShortfallStroops) : copy.coveredDescription}
              tone={hasShortfall ? "danger" : "success"}
            />
          </dl>
          {hasShortfall ? (
            <p className="mt-3 text-xs font-semibold text-[#9f342d]">
              {copy.shortfallMessage(formatStroops(data.sponsorShortfallStroops))}
            </p>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.sponsoredSectionTitle}</CardTitle>
            <CardDescription>{copy.sponsoredSectionDescription}</CardDescription>
          </CardHeader>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Stat
              label={copy.sponsoredCurrentLabel}
              value={formatStroops(data.sponsoredCurrentMinimumStroops)}
            />
            <Stat
              label={copy.sponsoredResultingLabel}
              value={formatStroops(data.sponsoredResultingMinimumStroops)}
            />
            <Stat
              label={copy.sponsoredStillNeedsLabel}
              value={formatStroops(data.sponsoredStillNeedsStroops)}
              emphasize
            />
          </dl>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{copy.sandwichTitle}</CardTitle>
          <CardDescription>{copy.sandwichDescription}</CardDescription>
        </CardHeader>
        <ol className="space-y-2">
          {data.sandwich.map((step, index) => (
            <li key={`${step.operation}-${index}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#d9f4ff] text-xs font-bold text-[#146783]">
                {index + 1}
              </span>
              <code className="font-mono text-xs font-bold text-[#172033]">
                {copy.operationNames[step.operation]}
              </code>
              {step.reference ? (
                <span className="max-w-[16rem] truncate font-mono text-xs text-[#68758a]">
                  {step.reference}
                </span>
              ) : null}
              <span className="ml-auto text-xs font-semibold text-[#4e5c73]">
                {copy.sandwichSource[step.source]}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#68758a]">
          <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {copy.sandwichNote}
        </p>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize = false,
  tone = "default"
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  tone?: "default" | "success" | "danger";
}) {
  const tones = {
    default: "text-[#172033]",
    success: "text-[#17664b]",
    danger: "text-[#9f342d]"
  };
  return (
    <div className="rounded-lg border border-[#e3ebf5] bg-white/60 p-4">
      <dt className="text-sm font-bold text-[#4e5c73]">{label}</dt>
      <dd
        className={`mt-1 text-lg font-extrabold ${tones[tone]} ${emphasize ? "text-2xl" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
