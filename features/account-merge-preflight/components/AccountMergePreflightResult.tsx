import { Badge } from "@/core/ui/Badge";
import { Button } from "@/core/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import {
  checkCopy,
  copy,
  describeBlocker
} from "@/features/account-merge-preflight/copy";
import type { AccountMergePreflightResult as AccountMergePreflightResultValue } from "@/features/account-merge-preflight/types";

export function AccountMergePreflightResult({
  result,
  onReset
}: {
  result: AccountMergePreflightResultValue;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      <StatusMessage
        type={result.mergeable ? "success" : "warning"}
        title={result.mergeable ? copy.mergeableTitle : copy.blockedTitle}
        description={result.mergeable ? copy.mergeableDescription : copy.blockedDescription}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.detailsTitle}</CardTitle>
          <CardDescription>{copy.snapshotNote}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.sourceAccount,
              value: <CopyableValue label={copy.copySource} value={result.sourceAccountId} />
            },
            {
              label: copy.destinationAccount,
              value: (
                <CopyableValue label={copy.copyDestination} value={result.destinationAccountId} />
              )
            },
            {
              label: copy.transferableXlm,
              value: `${result.transferableXlm} ${copy.xlmSuffix}`,
              mono: true
            },
            {
              label: copy.maximumReceivableXlm,
              value: `${result.destinationMaximumReceivableXlm} ${copy.xlmSuffix}`,
              mono: true
            },
            {
              label: copy.signerWeight,
              value: `${result.configuredSignerWeight} / ${result.requiredSignerWeight}`,
              mono: true
            },
            {
              label: copy.sponsoredSubentries,
              value: result.sponsoredSubentryCount.toString(),
              mono: true
            }
          ]}
        />
        {result.sponsoredSubentryCount > 0n ? (
          <p className="mt-3 text-xs leading-5 text-[#68758a]">{copy.sponsoredSubentriesNote}</p>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.checksTitle}</CardTitle>
        </CardHeader>
        <ul className="space-y-3">
          {result.checks.map((check) => {
            const content = checkCopy[check.id];
            return (
              <li
                key={check.id}
                className="flex items-start gap-3 rounded-md border border-[#e3ebf5] bg-white/60 p-3"
              >
                <Badge tone={check.passed ? "success" : "danger"}>
                  {check.passed ? copy.pass : copy.blocked}
                </Badge>
                <div>
                  <p className="text-sm font-bold text-[#172033]">{content.title}</p>
                  <p className="mt-1 text-sm leading-5 text-[#68758a]">
                    {check.passed ? content.passed : content.failed}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {!result.mergeable ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.blockersTitle}</CardTitle>
          </CardHeader>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[#4e5c73]">
            {result.blockers.map((blocker, index) => (
              <li key={`${blocker.kind}-${index}`}>{describeBlocker(blocker)}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Button type="button" variant="secondary" onClick={onReset}>
        {copy.reset}
      </Button>
    </div>
  );
}
