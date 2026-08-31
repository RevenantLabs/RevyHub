import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CodeBlock } from "@/core/ui/CodeBlock";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { copy } from "@/features/predicate-builder/copy";
import type { PredicateBuilderResult } from "@/features/predicate-builder/types";

export function PredicateBuilderResult({ result }: { result: PredicateBuilderResult }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{copy.plainLanguageTitle}</CardTitle>
          <CardDescription>{copy.plainLanguageIntro}</CardDescription>
        </CardHeader>
        <div className="mt-4 rounded-md border border-[#c7d6e8] bg-[#f7fafd] p-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-[#172033]">
            {result.plainLanguage}
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.xdrTitle}</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <CodeBlock label={copy.xdrLabel}>{result.xdrBase64}</CodeBlock>
          <div className="flex items-center gap-2">
            <CopyableValue
              label={copy.xdrLabel}
              value={result.xdrBase64}
              visible={12}
              full={false}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
