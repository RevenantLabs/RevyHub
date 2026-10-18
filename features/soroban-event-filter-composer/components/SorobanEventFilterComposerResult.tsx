"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui";
import { copy } from "../copy";
import type { EventFilterReport } from "../types";
import { EventRows } from "./EventRows";
import { FilterPreview } from "./FilterPreview";
import { RetentionNotice } from "./RetentionNotice";

export function SorobanEventFilterComposerResult({ result }: { result: EventFilterReport }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <RetentionNotice oldestLedger={result.oldestLedger} latestLedger={result.latestLedger} truncated={result.truncated} />
        <EventRows rows={result.rows} />
      </Card>
      <FilterPreview filter={result.filter} />
    </div>
  );
}
