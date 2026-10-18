"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/ledger-protocol-transition-map/copy";

export function LedgerProtocolTransitionMapEmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.emptyTitle}</CardTitle>
      </CardHeader>
      <p className="text-sm text-[#68758a]">{copy.emptyDescription}</p>
    </Card>
  );
}
