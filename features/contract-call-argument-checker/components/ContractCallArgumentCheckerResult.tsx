"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui";
import { copy } from "../copy";
import type { ArgumentReport } from "../types";
import { ArgumentRows } from "./ArgumentRows";
import { MismatchTree } from "./MismatchTree";

export function ContractCallArgumentCheckerResult({ result }: { result: ArgumentReport }) {
  return (
    <Card>
      <CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
      <p>{result.selected}</p>
      <ArgumentRows expected={result.expected} actual={result.actual} />
      <MismatchTree mismatches={result.mismatches} />
    </Card>
  );
}
