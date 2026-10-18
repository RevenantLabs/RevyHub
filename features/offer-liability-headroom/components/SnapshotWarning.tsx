"use client";

import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/offer-liability-headroom/copy";
import type { OfferLiabilityHeadroomResult } from "@/features/offer-liability-headroom/types";

export function SnapshotWarning({ result }: { result: OfferLiabilityHeadroomResult }) {
  return (
    <div className="space-y-3">
      <StatusMessage type="info" title={copy.warningsTitle} description={result.disclaimer} />
      {result.ledgerSkew ? (
        <StatusMessage type="warning" title="Ledger skew" description={copy.skewWarning} />
      ) : null}
      {result.unmatchedOfferCount > 0 ? (
        <StatusMessage
          type="warning"
          title={copy.unmatchedLabel}
          description={copy.unmatchedWarning}
        />
      ) : null}
    </div>
  );
}
