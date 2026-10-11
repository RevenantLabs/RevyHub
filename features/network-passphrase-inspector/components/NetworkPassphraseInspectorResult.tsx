import { Card } from "@/core/ui/Card";
import { copy } from "@/features/network-passphrase-inspector/copy";
import { formatNetworkType, truncateUrl } from "@/features/network-passphrase-inspector/lib/format";
import type { NetworkInfo } from "@/features/network-passphrase-inspector/types";

interface Props {
  results: NetworkInfo[];
}

export function NetworkPassphraseInspectorResult({ results }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#68758a]">{results.length} network(s) found</p>
      {results.map((network) => (
        <Card key={network.passphrase}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#172033]">{network.name}</h3>
              <div className="flex gap-2">
                {network.isDefault && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    {copy.default}
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  network.type === "mainnet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {formatNetworkType(network.type)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-[#68758a]">{copy.passphraseLabel}: </span>
                <code className="text-[#172033] font-mono text-xs break-all">{network.passphrase}</code>
              </div>
              <div>
                <span className="font-medium text-[#68758a]">{copy.horizonLabel}: </span>
                <code className="text-[#172033] font-mono text-xs">{network.horizonUrl}</code>
              </div>
              <div>
                <span className="font-medium text-[#68758a]">{copy.sorobanLabel}: </span>
                <span className="text-[#172033]">{network.sorobanEnabled ? copy.enabled : copy.disabled}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
