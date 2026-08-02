"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import {
  validateContractId,
  getContractExplorerUrl
} from "@/lib/stellar/validateAddress";

export default function SorobanContractPage() {
  const { network } = useNetwork();
  const [contractId, setContractId] = useState("");
  const result = useMemo(() => validateContractId(contractId), [contractId]);
  const hasInput = contractId.trim().length > 0;
  const isValid = hasInput && result.valid;

  const explorerUrl = isValid
    ? getContractExplorerUrl(contractId.trim(), network)
    : null;

  const networkSupported = network === "testnet" || network === "mainnet";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="crystal"
        eyebrow="Crystal orb"
        title="Soroban Contract Validator"
        description="The crystal orb reads the StrKey runes of a Soroban contract ID, validates its checksum, decodes the 32-byte payload, and links to the contract explorer on the selected network."
      />

      <Card className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#29364d]">
            Soroban contract ID
          </span>
          <Input
            value={contractId}
            onChange={(event) => setContractId(event.target.value)}
            placeholder="C..."
            spellCheck={false}
          />
        </label>

        {hasInput ? (
          <div className="space-y-4">
            <StatusMessage
              type={result.valid ? "success" : "error"}
              title={
                result.valid
                  ? "Valid contract ID"
                  : "Invalid contract ID"
              }
              description={result.message}
            />

            {result.valid && (
              <div className="rounded-lg border border-[#70c7a7]/70 bg-[#e1f8ef] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge tone="success">StrKey decoded</Badge>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="font-medium text-[#17664b]">Payload bytes (hex)</dt>
                    <CopyableValue
                      label="payload hex"
                      value={result.decodedHex ?? ""}
                      visible={16}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="font-medium text-[#17664b]">Payload length</dt>
                    <dd className="font-mono text-[#29364d]">32 bytes</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="font-medium text-[#17664b]">Checksum</dt>
                    <dd className="font-mono text-[#29364d]">
                      {result.checksumValid ? "Valid" : "Invalid"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="font-medium text-[#17664b]">Encoding</dt>
                    <dd className="font-mono text-[#29364d]">
                      StrKey (version byte + 32-byte payload + 2-byte checksum)
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {isValid && explorerUrl && networkSupported ? (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-[#82cbe3]/80 bg-white/60 px-4 py-2.5 text-sm font-extrabold text-[#178fb5] transition hover:bg-[#e0f6ff] hover:shadow-[0_2px_0_rgba(255,139,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47a8c7]"
                aria-label={`Open contract in Stellar Expert on ${network}`}
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Open in Stellar Expert ({network})
              </a>
            ) : isValid && !networkSupported ? (
              <Button
                type="button"
                variant="ghost"
                disabled
                className="cursor-not-allowed opacity-50"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Explorer not available for this network
              </Button>
            ) : null}
          </div>
        ) : (
          <StatusMessage
            type="info"
            title="Present the contract ID to the crystal orb"
            description="Soroban contract IDs start with C and use StrKey encoding. Enter one above to validate its structure and see the decoded payload."
          />
        )}
      </Card>
    </div>
  );
}
