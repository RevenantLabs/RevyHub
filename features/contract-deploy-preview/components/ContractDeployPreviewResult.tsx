import { Badge, Card, CardHeader, CardTitle } from "@/core/ui";
import { copy } from "../copy";
import { shortenHex } from "../lib/format";
import type { ContractDeployPreview } from "../types";
import { ConstructorArgRows } from "./ConstructorArgRows";
import { PreimageSourceInfo } from "./PreimageSourceInfo";

export function ContractDeployPreviewResult({ result }: { result: ContractDeployPreview }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <div className="mb-3">
        <Badge tone="info">{result.isV2 ? "CreateContractV2" : "CreateContract"}</Badge>
      </div>
      <PreimageSourceInfo preimage={result.preimage} />
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-bold text-[#4e5c73]">{copy.executableTitle}</h3>
        <p className="font-mono text-xs">
          {result.executable.kind === "wasm" ? `${copy.executableWasmLabel}: ${shortenHex(result.executable.hashHex, 10)}` : copy.executableStellarAssetLabel}
        </p>
      </div>
      <div className="mt-4">
        <ConstructorArgRows args={result.constructorArgs} />
      </div>
    </Card>
  );
}
