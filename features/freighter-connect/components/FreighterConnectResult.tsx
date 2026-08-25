import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { NETWORK_LABELS } from "@/core/network/config";
import type { StellarNetwork } from "@/core/network/types";
import { copy } from "@/features/freighter-connect/copy";
import { formatWalletNetwork } from "@/features/freighter-connect/lib/format";
import type { WalletSnapshot } from "@/features/freighter-connect/types";

export function FreighterConnectResult({
  snapshot,
  appNetwork
}: {
  snapshot: WalletSnapshot;
  appNetwork: StellarNetwork;
}) {
  if (!snapshot.allowed) {
    return (
      <StatusMessage
        type="info"
        title={copy.notAllowedTitle}
        description={copy.notAllowedDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <StatusMessage type="success" title={copy.detectedTitle} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelPublicKey,
              value: snapshot.publicKey ? (
                <CopyableValue label="wallet public key" value={snapshot.publicKey} />
              ) : (
                "Not reported"
              )
            },
            {
              label: copy.labelWalletNetwork,
              value: formatWalletNetwork(snapshot.network, snapshot.rawNetwork)
            },
            { label: copy.labelAppNetwork, value: NETWORK_LABELS[appNetwork] }
          ]}
        />
      </Card>
    </div>
  );
}
