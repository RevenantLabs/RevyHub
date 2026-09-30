import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/sep12-fields/copy";
import {
  formatGroup,
  formatMatchCount,
  formatType,
  toCamelCase
} from "@/features/sep12-fields/lib/format";
import type { Sep12FieldsResult as Sep12FieldsResultValue } from "@/features/sep12-fields/types";

export function Sep12FieldsResult({ result }: { result: Sep12FieldsResultValue }) {
  const isNoMatch = result.matchedFields === 0;

  if (isNoMatch) {
    return (
      <StatusMessage
        type="info"
        title={copy.noMatchesTitle}
        description={copy.noMatchesDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultsTitle}</CardTitle>
          <CardDescription>
            {formatMatchCount(result.matchedFields, result.totalFields)}
          </CardDescription>
        </CardHeader>
        <p className="text-xs leading-5 text-[#68758a]">{copy.requirementNote}</p>
      </Card>

      {result.groups.map((entry) => (
        <Card key={entry.group}>
          <CardHeader>
            <CardTitle>{formatGroup(entry.group)}</CardTitle>
          </CardHeader>
          <ul className="space-y-3">
            {entry.matches.map((match) => (
              <li
                key={match.field.name}
                className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <CopyableValue label={copy.labelCanonical} value={match.field.name} full />
                  <span className="text-xs text-[#68758a]">{formatType(match.field.type)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4e5c73]">{match.field.description}</p>
                <p className="mt-2 text-xs leading-5 text-[#68758a]">
                  {copy.camelCaseLabel}:{" "}
                  <span className="font-mono">{toCamelCase(match.field.name)}</span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <p className="text-xs leading-5 text-[#68758a]">{copy.camelCaseNote}</p>
    </div>
  );
}
