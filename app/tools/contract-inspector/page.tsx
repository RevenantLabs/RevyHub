"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { ContractInspector } from "@/components/stellar/ContractInspector";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { validateContractId } from "@/lib/stellar/validateContractId";

export default function ContractInspectorPage() {
  const { network } = useNetwork();
  const [contractId, setContractId] = useState("");
  const result = useMemo(() => validateContractId(contractId), [contractId]);
  const hasInput = contractId.trim().length > 0;

  const statusConfig = {
    contract: { type: "success" as const, title: "Valid Soroban contract ID" },
    publicKey: { type: "error" as const, title: "Classic account address" },
    muxedAccount: { type: "error" as const, title: "Muxed account address" },
    secretSeed: { type: "error" as const, title: "Secret seed detected" },
    malformed: { type: "error" as const, title: "Invalid contract ID" },
    empty: { type: "info" as const, title: "Paste a contract ID to inspect" }
  };

  const config = statusConfig[result.type];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="detective"
        eyebrow="Contract inspector"
        title="Contract Inspector"
        description={`The inspector decodes Soroban contract ID badges and checks their StrKey credentials on Stellar ${network}.`}
      />
      <Card className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#29364d]">Soroban contract ID</span>
          <Input
            value={contractId}
            onChange={(event) => setContractId(event.target.value)}
            placeholder="C..."
            spellCheck={false}
          />
        </label>
        {hasInput ? (
          <StatusMessage
            type={config.type}
            title={config.title}
            description={result.message}
          />
        ) : (
          <StatusMessage
            type="info"
            title="Hand the contract badge to the inspector"
            description="Soroban contract IDs start with C. Paste one above to decode its StrKey payload and verify its checksum."
          />
        )}
        {result.valid ? (
          <ContractInspector contractId={contractId.trim()} result={result} network={network} />
        ) : null}
      </Card>
    </div>
  );
}
