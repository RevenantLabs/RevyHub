import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/sep10-inspector/copy";
import type { Sep10InspectorResult as Sep10InspectorResultValue } from "@/features/sep10-inspector/types";

export function Sep10InspectorResult({ result }: { result: Sep10InspectorResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[
        { label: "Summary", value: result.summary },
        { label: "Sequence", value: result.sequence, mono: true },
        { label: "Server signing account", value: result.serverSigningAccount ?? "Unavailable" },
        ...(result.timeBounds ? [{ label: "Time bounds", value: `${result.timeBounds.minTime} - ${result.timeBounds.maxTime}` }] : []),
      ]} />
      <ul className="mt-4 space-y-2" aria-label="Structural rules">
        {result.rules.map((rule) => (
          <li key={rule.name} className="flex items-start justify-between gap-3 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm">
            <span><strong>{rule.name}</strong><span className="ml-2 text-[#68758a]">{rule.detail}</span></span>
            <span className={rule.status === "pass" ? "text-emerald-700" : "text-red-700"}>{rule.status}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
