import { Badge } from "@/core/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/account-signers/copy";
import { formatWeight, signerRowKey } from "@/features/account-signers/lib/format";
import type { AccountSignersResult as AccountSignersResultValue } from "@/features/account-signers/types";

export function AccountSignersResult({ result }: { result: AccountSignersResultValue }) {
  const setupLabel = result.isNormalSingleSigner
    ? copy.normalAccountLabel
    : result.isMultisig
      ? copy.multisigAccountLabel
      : copy.customAccountLabel;
  const setupDescription = result.isNormalSingleSigner
    ? copy.normalAccountDescription
    : result.isMultisig
      ? copy.multisigAccountDescription
      : copy.customAccountDescription;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>
              {result.isNormalSingleSigner ? copy.normalAccountTitle : copy.resultTitle}
            </CardTitle>
            <Badge tone={result.isNormalSingleSigner ? "success" : "info"}>
              {setupLabel}
            </Badge>
          </div>
          <CardDescription>{setupDescription}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.accountLabel,
              value: (
                <CopyableValue
                  label={copy.accountLabel.toLowerCase()}
                  value={result.accountId}
                  visible={8}
                />
              )
            },
            {
              label: copy.totalWeightLabel,
              value: formatWeight(result.totalWeight),
              mono: true
            }
          ]}
        />
      </Card>

      {result.masterKeyDisabled ? (
        <StatusMessage
          type="warning"
          title={copy.masterDisabledTitle}
          description={copy.masterDisabledDescription}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.signersTitle}</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.signerTableCaption(result.accountId)}</caption>
            <thead>
              <tr className="border-b border-[#e3ebf5]">
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.signerKeyColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.signerWeightColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.signerTypeColumn}
                </th>
                <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                  {copy.signerRoleColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.signers.map((signer, index) => (
                <tr
                  key={signerRowKey(signer.key, signer.type)}
                  className="border-b border-[#f0f4f9] last:border-0"
                >
                  <th scope="row" className="py-3 pr-4 font-normal">
                    <CopyableValue
                      label={copy.signerCopyLabel(index + 1)}
                      value={signer.key}
                      visible={8}
                    />
                  </th>
                  <td className="py-3 pr-4 font-mono text-[#172033]">
                    {formatWeight(signer.weight)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-[#4e5c73]">
                    {signer.type}
                  </td>
                  <td className="py-3">
                    <span className="flex flex-wrap gap-2">
                      <Badge tone={signer.isMaster ? "info" : "muted"}>
                        {signer.isMaster ? copy.masterKeyLabel : copy.additionalSignerLabel}
                      </Badge>
                      {signer.isMaster && signer.weight === "0" ? (
                        <Badge tone="warning">{copy.disabledLabel}</Badge>
                      ) : null}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.thresholdsTitle}</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.thresholdTableCaption(result.accountId)}</caption>
            <thead>
              <tr className="border-b border-[#e3ebf5]">
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.thresholdLevelColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.thresholdOperationsColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.thresholdRequiredColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.thresholdAvailableColumn}
                </th>
                <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                  {copy.thresholdStatusColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.thresholdAssessments.map((threshold) => (
                <tr
                  key={threshold.level}
                  className="border-b border-[#f0f4f9] align-top last:border-0"
                >
                  <th scope="row" className="py-3 pr-4 font-semibold text-[#172033]">
                    {copy.thresholdLabels[threshold.level]}
                  </th>
                  <td className="max-w-md py-3 pr-4 leading-6 text-[#4e5c73]">
                    {copy.thresholdDescriptions[threshold.level]}
                  </td>
                  <td className="py-3 pr-4 font-mono text-[#172033]">
                    {formatWeight(threshold.requiredWeight)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-[#172033]">
                    {formatWeight(threshold.availableWeight)}
                  </td>
                  <td className="py-3">
                    <Badge tone={threshold.canBeMet ? "success" : "danger"}>
                      {threshold.canBeMet
                        ? copy.thresholdReachableLabel
                        : copy.thresholdUnreachableLabel}
                    </Badge>
                    {!threshold.canBeMet ? (
                      <p className="mt-2 max-w-xs text-xs leading-5 text-[#9f342d]">
                        {copy.thresholdUnreachableDescription}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
