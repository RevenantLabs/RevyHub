"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui";
import { copy } from "../copy";
import type { HashReport } from "../types";
import { CodeDetails } from "./CodeDetails";
import { HashComparison } from "./HashComparison";
import { InstanceDetails } from "./InstanceDetails";

export function ContractCodeHashVerifierResult({ result }: { result: HashReport }) {
  return (
    <Card>
      <CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
      <InstanceDetails instance={result.instance} />
      {result.code ? <CodeDetails code={result.code} /> : null}
      <HashComparison report={result} />
    </Card>
  );
}
