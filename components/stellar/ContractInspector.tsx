"use client";
import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { getContractExplorerLink } from "@/lib/stellar/explorer";
import type { ContractIdValidationResult } from "@/lib/stellar/validateContractId";
import type { StellarNetwork } from "@/lib/stellar/horizon";
import { ExternalLink } from "lucide-react";

interface ContractInspectorProps {
  contractId: string;
  result: ContractIdValidationResult;
  network: StellarNetwork;
}

export function ContractInspector({ contractId, result, network }: ContractInspectorProps) {
  if (!result.valid) {
    return null;
  }

  const explorer = getContractExplorerLink(contractId, network);
  const linkDisabled = !explorer.supported;

  return (
    <div className="space-y-4 rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.22)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#172033]">Contract ID inspection</p>
        <Badge tone="success">Soroban contract</Badge>
      </div>

      <dl className="divide-y divide-[#c7d6e8]">
        <div className="grid gap-1 px-1 py-3 sm:grid-cols-3">
          <dt className="text-xs uppercase tracking-wide text-[#68758a]">Contract ID</dt>
          <dd className="break-words text-sm text-[#29364d] sm:col-span-2">
            <CopyableValue label="contract ID" value={contractId} visible={10} />
          </dd>
        </div>
        <div className="grid gap-1 px-1 py-3 sm:grid-cols-3">
          <dt className="text-xs uppercase tracking-wide text-[#68758a]">Type</dt>
          <dd className="break-words text-sm text-[#29364d] sm:col-span-2">Soroban contract (StrKey version byte C)</dd>
        </div>
        <div className="grid gap-1 px-1 py-3 sm:grid-cols-3">
          <dt className="text-xs uppercase tracking-wide text-[#68758a]">Decoded payload (hex)</dt>
          <dd className="break-words text-sm text-[#29364d] sm:col-span-2">
            <code className="rounded bg-[#f0f4f8] px-2 py-0.5 text-xs font-mono text-[#29364d] break-all">
              {result.decodedPayload}
            </code>
          </dd>
        </div>
        <div className="grid gap-1 px-1 py-3 sm:grid-cols-3">
          <dt className="text-xs uppercase tracking-wide text-[#68758a]">Payload length</dt>
          <dd className="break-words text-sm text-[#29364d] sm:col-span-2">
            {result.decodedPayload ? `${result.decodedPayload.length / 2} bytes (256 bits)` : "Unknown"}
          </dd>
        </div>
        <div className="grid gap-1 px-1 py-3 sm:grid-cols-3">
          <dt className="text-xs uppercase tracking-wide text-[#68758a]">Checksum</dt>
          <dd className="break-words text-sm text-[#29364d] sm:col-span-2">
            <Badge tone={result.checksumValid ? "success" : "warning"}>
              {result.checksumValid ? "Valid" : "Invalid"}
            </Badge>
          </dd>
        </div>
        <div className="grid gap-1 px-1 py-3 sm:grid-cols-3">
          <dt className="text-xs uppercase tracking-wide text-[#68758a]">Network</dt>
          <dd className="break-words text-sm text-[#29364d] sm:col-span-2">
            <Badge tone="info">{network}</Badge>
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <a
          href={linkDisabled ? undefined : explorer.url}
          target="_blank"
          rel="noreferrer"
          aria-disabled={linkDisabled}
          tabIndex={linkDisabled ? -1 : 0}
          className={
            linkDisabled
              ? "inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-[#c7d6e8]/60 bg-white/40 px-3 py-2 text-sm font-extrabold text-[#68758a] opacity-50"
              : "inline-flex items-center gap-2 rounded-md border border-[#82cbe3]/80 bg-white/60 px-3 py-2 text-sm font-extrabold text-[#178fb5] hover:bg-[#e0f6ff]"
          }
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          {linkDisabled ? "Explorer not available for this network" : "Open in Stellar Expert"}
        </a>
      </div>
    </div>
  );
}
