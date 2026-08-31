import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/toml-validator/copy";
import type { TomlValidatorResult as TomlValidatorResultValue } from "@/features/toml-validator/types";

export function TomlValidatorResult({ result }: { result: TomlValidatorResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[
        { label: "Summary", value: result.summary },
        { label: "Source", value: result.source },
        { label: "CORS", value: result.cors.status },
        { label: "Errors", value: result.errors.join(", ") || "None" },
        { label: "Warnings", value: result.warnings.join(" ") || "None" },
      ]} />
      <ul className="mt-4 space-y-2" aria-label="SEP-1 field checks">
        {result.checks.map((check) => <li key={check.field} className="flex justify-between gap-3 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"><span><strong>{check.field}</strong><span className="ml-2 text-[#68758a]">{check.detail}</span></span><span>{check.status}</span></li>)}
      </ul>
    </Card>
  );
}
