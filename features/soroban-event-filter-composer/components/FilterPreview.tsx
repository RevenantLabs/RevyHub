"use client";

import { Card, CardHeader, CardTitle, CodeBlock } from "@/core/ui";
import { copy } from "../copy";
import { formatFilter } from "../lib/format";
import type { GetEventsParams } from "../types";

export function FilterPreview({ filter }: { filter: GetEventsParams }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.previewTitle}</CardTitle>
      </CardHeader>
      <CodeBlock>{formatFilter({ filter })}</CodeBlock>
    </Card>
  );
}
