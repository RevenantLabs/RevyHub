import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/anchor-discovery/copy";
import type { AnchorDiscoveryResult as AnchorDiscoveryResultValue } from "@/features/anchor-discovery/types";

export function AnchorDiscoveryResult({ result }: { result: AnchorDiscoveryResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[
        { label: "Summary", value: result.summary },
        { label: "Domain", value: result.domain },
        { label: "Signing key", value: result.signingKey ?? "Not declared" },
        { label: "Network passphrase", value: result.networkPassphrase ?? "Not declared" },
        { label: "Currencies", value: result.currencies.map((currency) => `${currency.code}${currency.issuer ? ` (${currency.issuer})` : ""}`).join(", ") || "None declared" },
      ]} />
      <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="SEP service presence">
        {Object.entries(result.services).map(([service, present]) => <li key={service} className="flex justify-between rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"><span>{service.toUpperCase()}</span><strong>{present ? "present" : "not declared"}</strong></li>)}
      </ul>
    </Card>
  );
}
