"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/offer-liability-headroom/copy";

export function OfferLiabilityHeadroomEmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.emptyTitle}</CardTitle>
      </CardHeader>
      <p className="text-sm text-[#68758a]">{copy.emptyDescription}</p>
    </Card>
  );
}
