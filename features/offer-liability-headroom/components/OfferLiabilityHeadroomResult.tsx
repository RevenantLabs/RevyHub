"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { LiabilityRows } from "@/features/offer-liability-headroom/components/LiabilityRows";
import { OfferRows } from "@/features/offer-liability-headroom/components/OfferRows";
import { SnapshotWarning } from "@/features/offer-liability-headroom/components/SnapshotWarning";
import { copy } from "@/features/offer-liability-headroom/copy";
import { formatNetworkLabel } from "@/features/offer-liability-headroom/lib/format";
import type { OfferLiabilityHeadroomResult } from "@/features/offer-liability-headroom/types";

export function OfferLiabilityHeadroomResultView({
  result
}: {
  result: OfferLiabilityHeadroomResult;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.networkLabel, value: formatNetworkLabel(result.network) },
            { label: copy.accountLabel, value: result.accountId, mono: true },
            { label: copy.accountLedgerLabel, value: result.accountLedger ?? "—" },
            { label: copy.offersLedgerLabel, value: result.offersLedger ?? "—" },
            { label: copy.unmatchedLabel, value: String(result.unmatchedOfferCount) }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.offersTitle}</CardTitle>
        </CardHeader>
        <OfferRows offers={result.offers} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.liabilitiesTitle}</CardTitle>
        </CardHeader>
        <LiabilityRows rows={result.liabilities} />
      </Card>

      <Card>
        <SnapshotWarning result={result} />
      </Card>
    </div>
  );
}
