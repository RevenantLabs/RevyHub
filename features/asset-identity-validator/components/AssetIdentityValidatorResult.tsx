import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { CanonicalAssetString } from "@/features/asset-identity-validator/components/CanonicalAssetString";
import { CodeTierBadge } from "@/features/asset-identity-validator/components/CodeTierBadge";
import { IssuerField } from "@/features/asset-identity-validator/components/IssuerField";
import { copy } from "@/features/asset-identity-validator/copy";
import { formatCodeLength } from "@/features/asset-identity-validator/lib/format";
import type { AssetIdentity } from "@/features/asset-identity-validator/types";

export function AssetIdentityValidatorResult({ result }: { result: AssetIdentity }) {
  return (
    <div className="min-w-0 space-y-4">
      <StatusMessage
        type="success"
        title={copy.successTitle}
        description={copy.successDescription}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <div className="min-w-0 space-y-4">
          <CodeTierBadge tier={result.tier} />
          <CanonicalAssetString value={result.canonical} />
          <IssuerField issuer={result.issuer} />
          <p className="text-sm text-[#4e5c73]">{formatCodeLength(result.length)}</p>
        </div>
      </Card>
    </div>
  );
}
