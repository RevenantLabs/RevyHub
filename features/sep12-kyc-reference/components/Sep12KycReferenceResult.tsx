import { Card } from "@/core/ui/Card";
import { copy } from "@/features/sep12-kyc-reference/copy";
import { formatCategory, formatExamples, formatFieldType, formatRequired } from "@/features/sep12-kyc-reference/lib/format";
import type { KycFieldDescription } from "@/features/sep12-kyc-reference/types";

interface Props {
  results: KycFieldDescription[];
}

export function Sep12KycReferenceResult({ results }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#68758a]">{results.length} {copy.resultCount}</p>
      {results.map((field) => (
        <Card key={field.name}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#172033] font-mono">{field.name}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${field.required ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                {formatRequired(field.required)}
              </span>
            </div>
            <p className="text-sm text-[#68758a]">{field.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-[#68758a]">{copy.fieldType}: </span>
                <span className="text-[#172033]">{formatFieldType(field.type)}</span>
              </div>
              <div>
                <span className="font-medium text-[#68758a]">{copy.fieldCategory}: </span>
                <span className="text-[#172033]">{formatCategory(field.category)}</span>
              </div>
              {field.examples && field.examples.length > 0 && (
                <div className="col-span-2">
                  <span className="font-medium text-[#68758a]">{copy.fieldExamples}: </span>
                  <span className="text-[#172033] font-mono">{formatExamples(field.examples)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
