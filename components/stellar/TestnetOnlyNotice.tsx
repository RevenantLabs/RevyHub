"use client";

import { StatusMessage } from "@/components/ui/StatusMessage";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { getNetworkLabel } from "@/lib/stellar/horizon";

interface TestnetOnlyNoticeProps {
  /** How the helper cast refers to the tool, e.g. "The faucet helper". */
  character: string;
  /** What the tool cannot do while a non-testnet network is selected. */
  reason: string;
}

/**
 * Shared banner for tools that can only ever talk to testnet. It explains the
 * limitation on testnet and, on any other network, warns that the tool is paused
 * and offers a one-click way back.
 */
export function TestnetOnlyNotice({ character, reason }: TestnetOnlyNoticeProps) {
  const { network, setNetwork } = useNetwork();

  if (network === "testnet") {
    return (
      <StatusMessage
        type="warning"
        title="Testnet only"
        description={`${character} works on testnet alone. ${reason}`}
      />
    );
  }

  return (
    <StatusMessage
      type="warning"
      title={`Paused on ${getNetworkLabel(network)}`}
      description={`${character} only pours on testnet, so it is resting while the app is set to ${getNetworkLabel(
        network
      )}. ${reason}`}
      action={
        <button
          type="button"
          onClick={() => setNetwork("testnet")}
          className="inline-flex rounded-md border border-[#82cbe3]/80 bg-white/60 px-3 py-2 text-sm font-extrabold text-[#178fb5] transition hover:bg-[#e0f6ff]"
        >
          Switch app to Testnet
        </button>
      }
    />
  );
}
