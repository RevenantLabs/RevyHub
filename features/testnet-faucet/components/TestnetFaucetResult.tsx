import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/testnet-faucet/copy";
import { STARTING_BALANCE, explorerUrl, formatLedger } from "@/features/testnet-faucet/lib/format";
import type { FaucetSuccess } from "@/features/testnet-faucet/types";

export function TestnetFaucetResult({ result }: { result: FaucetSuccess }) {
  return (
    <div className="space-y-4">
      <StatusMessage
        type="success"
        title={copy.successTitle}
        description={`Friendbot funded this account with ${STARTING_BALANCE}.`}
        action={
          <a
            href={explorerUrl(result.accountId)}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm font-bold text-[#146783] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47a8c7]"
          >
            {copy.viewOnExplorer}
          </a>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: "Account", value: <CopyableValue label="account" value={result.accountId} /> },
            {
              label: "Transaction",
              value: result.transactionHash ? (
                <CopyableValue label="transaction hash" value={result.transactionHash} visible={8} />
              ) : (
                "Not reported"
              )
            },
            { label: "Ledger", value: formatLedger(result.ledger), mono: true }
          ]}
        />
      </Card>
    </div>
  );
}
