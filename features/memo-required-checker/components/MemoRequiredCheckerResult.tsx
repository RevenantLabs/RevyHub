import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/memo-required-checker/copy";
import { formatSources } from "@/features/memo-required-checker/lib/format";
import type { MemoRequiredCheckerResult as ResultValue } from "@/features/memo-required-checker/types";
import { DataEntrySignal } from "@/features/memo-required-checker/components/DataEntrySignal";
import { MemoRequiredVerdict } from "@/features/memo-required-checker/components/MemoRequiredVerdict";
import { TomlSignal } from "@/features/memo-required-checker/components/TomlSignal";

export function MemoRequiredCheckerResult({ result }: { result: ResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <p className="text-sm font-medium">{copy.bestEffortTitle}</p>
      <p className="mt-1 text-sm text-white/60">{result.bestEffortNotice}</p>
      <div className="mt-4 space-y-4">
        <MemoRequiredVerdict result={result} />
        <DataEntrySignal signal={result.dataEntry} />
        <TomlSignal signal={result.toml} />
        <DataList
          items={[
            { label: copy.sourcesLabel, value: formatSources(result.sources) },
            { label: copy.homeDomainLabel, value: result.homeDomain ?? copy.notPublished }
          ]}
        />
      </div>
    </Card>
  );
}
