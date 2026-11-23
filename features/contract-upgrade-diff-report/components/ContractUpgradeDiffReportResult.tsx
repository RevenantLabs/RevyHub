import { Badge } from "@/core/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, reasonLabels, statusLabels } from "@/features/contract-upgrade-diff-report/copy";
import {
  formatByteSize,
  formatCodeHash,
  formatEnvVersion,
  formatSide,
  statusTone
} from "@/features/contract-upgrade-diff-report/lib/format";
import { InterfaceChangeRows } from "@/features/contract-upgrade-diff-report/components/InterfaceChangeRows";
import { CompatibilityCoverage } from "@/features/contract-upgrade-diff-report/components/CompatibilityCoverage";
import type { UpgradeReport } from "@/features/contract-upgrade-diff-report/types";

function Verdict({ report }: { report: UpgradeReport }) {
  const { counts } = report;
  if (report.codeIdentical) {
    return <StatusMessage type="success" title={copy.identicalTitle} description={copy.identicalDescription} />;
  }
  if (counts.removed + counts.changed > 0) {
    return <StatusMessage type="warning" title={copy.breakingTitle} description={copy.breakingDescription} />;
  }
  // Without complete evidence, "nothing broke" is not something this report can say.
  if (!report.interfaceComplete) return null;
  if (counts.added > 0) {
    return <StatusMessage type="info" title={copy.additiveTitle} description={copy.additiveDescription} />;
  }
  return <StatusMessage type="info" title={copy.sameInterfaceTitle} description={copy.sameInterfaceDescription} />;
}

export function ContractUpgradeDiffReportResult({ report }: { report: UpgradeReport }) {
  const { counts, environment } = report;
  const preRelease = (environment.before?.preRelease ?? 0) !== 0 || (environment.after?.preRelease ?? 0) !== 0;

  return (
    <div className="space-y-4">
      {!report.interfaceComplete ? (
        <StatusMessage type="warning" title={copy.incompleteTitle} description={copy.incompleteDescription} />
      ) : null}
      <Verdict report={report} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.overviewTitle}</CardTitle>
        </CardHeader>
        <p className="text-xs leading-5 text-[#68758a]">{copy.disclaimer}</p>
        <DataList
          items={[
            { label: copy.labelOldFile, value: report.old.fileName },
            { label: copy.labelOldSize, value: formatByteSize(report.old.byteLength), mono: true },
            { label: copy.labelOldHash, value: formatCodeHash(report.old.codeHash), mono: true },
            { label: copy.labelNewFile, value: report.new.fileName },
            { label: copy.labelNewSize, value: formatByteSize(report.new.byteLength), mono: true },
            { label: copy.labelNewHash, value: formatCodeHash(report.new.codeHash), mono: true },
            { label: copy.labelRemoved, value: String(counts.removed), mono: true },
            { label: copy.labelChanged, value: String(counts.changed), mono: true },
            { label: copy.labelAdded, value: String(counts.added), mono: true },
            { label: copy.labelUnchanged, value: String(counts.unchanged), mono: true },
            { label: copy.labelUnknown, value: String(counts.unknown), mono: true }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.declarationsTitle}</CardTitle>
        </CardHeader>
        <InterfaceChangeRows
          changes={report.declarations}
          specUnavailable={report.old.declarations === null || report.new.declarations === null}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.environmentTitle}</CardTitle>
        </CardHeader>
        <div className="mb-2">
          <Badge tone={statusTone(environment.status)}>{statusLabels[environment.status]}</Badge>
        </div>
        <DataList
          items={[
            { label: copy.columnBefore, value: formatEnvVersion(environment.before), mono: true },
            { label: copy.columnAfter, value: formatEnvVersion(environment.after), mono: true }
          ]}
        />
        {environment.reason ? (
          <p className="mt-2 text-xs leading-5 text-[#146783]">{reasonLabels[environment.reason]}</p>
        ) : null}
        {environment.status === "changed" ? (
          <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.environmentChangedNote}</p>
        ) : null}
        {preRelease ? <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.preReleaseNote}</p> : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.metadataTitle}</CardTitle>
        </CardHeader>
        {report.metadata.length ? (
          <ol className="space-y-2">
            {report.metadata.map((entry) => (
              <li
                key={entry.key}
                className="space-y-1 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-all font-mono font-semibold text-[#172033]">{entry.key}</span>
                  <Badge tone={statusTone(entry.status)}>{statusLabels[entry.status]}</Badge>
                </div>
                <p className="break-words font-mono text-[#172033]">
                  {formatSide(entry.before)} → {formatSide(entry.after)}
                </p>
                {entry.reason ? <p className="text-[#146783]">{reasonLabels[entry.reason]}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-[#4e5c73]">
            {report.old.metadata === null || report.new.metadata === null
              ? reasonLabels.meta_unavailable
              : copy.metadataEmpty}
          </p>
        )}
      </Card>

      <CompatibilityCoverage report={report} />
    </div>
  );
}
