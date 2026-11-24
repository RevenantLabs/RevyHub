import { Badge } from "@/core/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import {
  copy,
  evidenceExplanations,
  evidenceLabels,
  sectionLabels,
  sideLabels
} from "@/features/contract-upgrade-diff-report/copy";
import { evidenceTone, fill, formatByteSize } from "@/features/contract-upgrade-diff-report/lib/format";
import {
  METADATA_SECTIONS,
  type EvidenceGap,
  type UpgradeReport
} from "@/features/contract-upgrade-diff-report/types";

function gapText(gap: EvidenceGap): string {
  if (gap.type === "section") {
    return `${sectionLabels[gap.section]} — ${evidenceLabels[gap.status]}. ${evidenceExplanations[gap.status]}`;
  }
  const detail = gap.member
    ? fill(copy.collisionMember, { member: gap.member })
    : fill(copy.collisionName, { count: gap.count });
  return `${gap.name} ${detail}.`;
}

/** Which sections each file contained, what failed to decode, and the tool's limits. */
export function CompatibilityCoverage({ report }: { report: UpgradeReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.coverageTitle}</CardTitle>
        <CardDescription>{copy.coverageDescription}</CardDescription>
      </CardHeader>

      <div className="space-y-5">
        {[report.old, report.new].map((side) => (
          <section key={side.side} className="space-y-2" aria-labelledby={`coverage-${side.side}`}>
            <h3 id={`coverage-${side.side}`} className="text-sm font-bold text-[#4e5c73]">
              {side.side === "old" ? copy.labelOldFile : copy.labelNewFile}:{" "}
              <span className="break-all font-mono">{side.fileName}</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-xs">
                <thead>
                  <tr className="text-[#4e5c73]">
                    <th scope="col" className="py-2 pr-3">{copy.columnSection}</th>
                    <th scope="col" className="py-2 pr-3">{copy.columnStatus}</th>
                    <th scope="col" className="py-2 pr-3">{copy.columnEntries}</th>
                    <th scope="col" className="py-2">{copy.columnBytes}</th>
                  </tr>
                </thead>
                <tbody>
                  {METADATA_SECTIONS.map((section) => {
                    const evidence = side.sections[section];
                    return (
                      <tr key={section} className="border-t border-[#e3ebf5] text-[#172033]">
                        <th scope="row" className="py-2 pr-3 font-normal">{sectionLabels[section]}</th>
                        <td className="py-2 pr-3">
                          <Badge tone={evidenceTone(evidence.status)}>{evidenceLabels[evidence.status]}</Badge>
                        </td>
                        <td className="py-2 pr-3 font-mono">{evidence.entryCount}</td>
                        <td className="py-2 font-mono">{formatByteSize(evidence.byteLength)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {report.duplicateSections.length ? (
          <ul className="space-y-1 text-xs text-[#4e5c73]">
            {report.duplicateSections.map((duplicate) => (
              <li key={`${duplicate.side}:${duplicate.section}`}>
                <span className="font-mono">{duplicate.section}</span>{" "}
                {fill(copy.duplicateNote, { count: duplicate.count, side: sideLabels[duplicate.side] })}
              </li>
            ))}
          </ul>
        ) : null}

        <section className="space-y-2" aria-labelledby="coverage-gaps">
          <h3 id="coverage-gaps" className="text-sm font-bold text-[#4e5c73]">{copy.gapsTitle}</h3>
          {report.gaps.length ? (
            <ul className="space-y-1 text-xs text-[#172033]">
              {report.gaps.map((gap, index) => (
                <li key={index}>
                  <span className="font-bold">{sideLabels[gap.side]}</span> · {gapText(gap)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#4e5c73]">{copy.noGaps}</p>
          )}
        </section>

        <section className="space-y-2" aria-labelledby="coverage-limits">
          <h3 id="coverage-limits" className="text-sm font-bold text-[#4e5c73]">{copy.limitsTitle}</h3>
          <ul className="list-disc space-y-1 pl-5 text-xs text-[#4e5c73]">
            {copy.limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </section>
      </div>
    </Card>
  );
}
