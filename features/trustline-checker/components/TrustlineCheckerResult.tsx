import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/trustline-checker/copy";
import {
  describeAuthorization,
  formatAssetIdentity,
  formatLimit
} from "@/features/trustline-checker/lib/format";
import type { TrustlineResult } from "@/features/trustline-checker/types";

export function TrustlineCheckerResult({ result }: { result: TrustlineResult }) {
  if (!result.exists) {
    return (
      <div className="space-y-4">
        <StatusMessage
          type="warning"
          title={copy.missingTitle}
          description={`${result.assetCode} from this issuer is not trusted by the account.`}
        />

        {result.otherIssuers.length ? (
          <Card>
            <CardHeader>
              <CardTitle>{copy.otherIssuersTitle}</CardTitle>
            </CardHeader>
            <ul className="space-y-2">
              {result.otherIssuers.map((issuer) => (
                <li key={issuer}>
                  <CopyableValue label="issuer" value={issuer} visible={6} />
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatusMessage type="success" title={copy.foundTitle} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: "Asset", value: formatAssetIdentity(result.assetCode, result.issuerId), mono: true },
            { label: "Balance", value: result.balance, mono: true },
            { label: "Trust limit", value: formatLimit(result.limit) },
            { label: copy.buyingLiabilitiesLabel, value: result.buyingLiabilities, mono: true },
            {
              label: copy.remainingReceivingCapacityLabel,
              value: result.remainingReceivingCapacity,
              mono: true
            },
            {
              label: "Authorization",
              value: describeAuthorization(
                result.authorized,
                result.authorizedToMaintainLiabilities
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
