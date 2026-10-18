"use client";

import { Card, CardHeader, CardTitle, CopyableValue } from "@/core/ui";
import { copy } from "../copy";
import { formatReport } from "../lib/format";
import type { AuditReport } from "../types";
import { PolicyRules } from "./PolicyRules";
import { RequestFields } from "./RequestFields";
import { RuleVerdicts } from "./RuleVerdicts";

export function Sep7RequestPolicyAuditorResult({ result }: { result: AuditReport }) {
  return (
    <Card>
      <CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
      <RequestFields fields={result.fields} />
      <PolicyRules policy={result.policy} />
      <RuleVerdicts verdicts={result.verdicts} />
      <CopyableValue value={formatReport(result)} label="Copyable verdict" />
    </Card>
  );
}
