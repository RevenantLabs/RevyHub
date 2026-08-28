import { ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/sponsored-reserves/copy";
import {
  formatEntryReference,
  formatStroops,
  reserveEffectDirection
} from "@/features/sponsored-reserves/lib/format";
import type { SponsoredReservesResult as SponsoredReservesResultValue } from "@/features/sponsored-reserves/types";

function effectDescription(stroops: string): string {
  const direction = reserveEffectDirection(stroops);
  if (direction === "relief") return copy.netReliefDescription;
  if (direction === "burden") return copy.netBurdenDescription;
  return copy.netNeutralDescription;
}

export function SponsoredReservesResult({ data }: { data: SponsoredReservesResultValue }) {
  const hasRelationships = data.numSponsored > 0 || data.numSponsoring > 0;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>

        <dl className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-[#e3ebf5] bg-white/60 p-4">
            <dt className="text-sm font-bold text-[#4e5c73]">{copy.sponsoredForLabel}</dt>
            <dd className="mt-2 text-[#172033]">
              <span className="block text-2xl font-extrabold">
                {copy.reserveUnits(data.numSponsored)}
              </span>
              <span className="mt-1 block text-xs font-normal leading-5 text-[#68758a]">
                {copy.sponsoredForDescription}
              </span>
            </dd>
          </div>
          <div className="rounded-lg border border-[#e3ebf5] bg-white/60 p-4">
            <dt className="text-sm font-bold text-[#4e5c73]">{copy.sponsoringLabel}</dt>
            <dd className="mt-2 text-[#172033]">
              <span className="block text-2xl font-extrabold">
                {copy.reserveUnits(data.numSponsoring)}
              </span>
              <span className="mt-1 block text-xs font-normal leading-5 text-[#68758a]">
                {copy.sponsoringDescription}
              </span>
            </dd>
          </div>
          <div className="rounded-lg border border-[#e3ebf5] bg-white/60 p-4">
            <dt className="text-sm font-bold text-[#4e5c73]">{copy.netEffectLabel}</dt>
            <dd className="mt-2 text-[#172033]">
              <span className="block text-2xl font-extrabold">
                {formatStroops(data.netReserveEffectStroops, true)} {copy.xlmUnit}
              </span>
              <span className="mt-1 block text-xs font-normal leading-5 text-[#68758a]">
                {effectDescription(data.netReserveEffectStroops)}
              </span>
            </dd>
          </div>
        </dl>
      </Card>

      {!hasRelationships ? (
        <EmptyState
          icon={ShieldCheck}
          title={copy.noRelationshipsTitle}
          description={copy.noRelationshipsDescription}
        />
      ) : null}

      {hasRelationships && !data.sponsoredEntries.length ? (
        <EmptyState
          icon={ShieldCheck}
          title={copy.noSponsoredEntriesTitle}
          description={copy.noSponsoredEntriesDescription}
        />
      ) : null}

      {data.sponsoredEntries.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.entriesTitle}</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
              <caption className="sr-only">{copy.entriesCaption(data.accountId)}</caption>
              <thead>
                <tr className="border-b border-[#e3ebf5]">
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnKind}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnEntry}
                  </th>
                  <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                    {copy.columnSponsor}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.sponsoredEntries.map((entry) => {
                  const reference = formatEntryReference(entry);
                  return (
                    <tr key={entry.id} className="border-b border-[#f0f4f9] last:border-0">
                      <td className="py-3 pr-4 font-semibold text-[#172033]">
                        {copy.entryKinds[entry.kind]}
                      </td>
                      <th
                        scope="row"
                        className="max-w-xs break-all py-3 pr-4 font-mono text-xs font-medium text-[#172033]"
                      >
                        {reference}
                      </th>
                      <td className="py-3">
                        <CopyableValue
                          label={copy.sponsorCopyLabel(reference)}
                          value={entry.sponsor}
                          visible={4}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-[#68758a]">{copy.entriesNote}</p>
        </Card>
      ) : null}
    </div>
  );
}
