"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { useNetwork } from "@/components/stellar/NetworkProvider";

declare global {
  interface Window {
    freighterApi?: {
      isConnected?: () => Promise<boolean>;
      isAllowed?: () => Promise<boolean>;
      getPublicKey?: () => Promise<string>;
      getNetwork?: () => Promise<string>;
    };
  }
}

function normalizeFreighterNetwork(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("test")) return "testnet";
  if (normalized.includes("public") || normalized.includes("main")) return "mainnet";

  return "unknown";
}

// TODO(issue RevenantLabs/RevyHub#7): Improve not-installed guidance, detection loading, and rejection feedback.
export default function FreighterConnectPage() {
  const { network } = useNetwork();
  const [detecting, setDetecting] = useState(true);
  const [available, setAvailable] = useState(false);
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [walletNetwork, setWalletNetwork] = useState("");
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The wallet mascot is listening for Freighter in this browser." });
  const walletNetworkKind = walletNetwork ? normalizeFreighterNetwork(walletNetwork) : "";
  const networkMismatch =
    walletNetworkKind !== "" && walletNetworkKind !== "unknown" && walletNetworkKind !== network;

  useEffect(() => {
    let active = true;

    async function inspectFreighter() {
      const detected = Boolean(window.freighterApi);
      if (!active) return;

      setAvailable(detected);

      if (!detected) {
        setConnected(false);
        setWalletNetwork("");
        setMessage({
          type: "warning",
          text: "The wallet mascot could not find Freighter in this browser."
        });
        return;
      }

      const api = window.freighterApi;
      const isConnected = api?.isConnected ? await api.isConnected().catch(() => false) : false;
      const isAllowed = api?.isAllowed ? await api.isAllowed().catch(() => false) : false;
      const nextWalletNetwork = api?.getNetwork ? await api.getNetwork().catch(() => "") : "";

      if (!active) return;

      setConnected(isConnected || isAllowed);
      setWalletNetwork(nextWalletNetwork);
      setMessage({
        type: isConnected || isAllowed ? "success" : "info",
        text:
          isConnected || isAllowed
            ? "The wallet mascot can reach Freighter and the site is already allowed."
            : "The wallet mascot spotted Freighter. You can request the public key."
      });
    }

    void inspectFreighter().finally(() => {
      if (active) setDetecting(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function connect() {
    if (!window.freighterApi?.getPublicKey) {
      setMessage({ type: "warning", text: "The wallet mascot cannot reach the Freighter API in this browser." });
      return;
    }

    try {
      setMessage({ type: "info", text: "The wallet mascot is asking Freighter for the public key..." });
      const key = await window.freighterApi.getPublicKey();
      const nextWalletNetwork = window.freighterApi.getNetwork
        ? await window.freighterApi.getNetwork().catch(() => "")
        : walletNetwork;
      setPublicKey(key);
      setConnected(true);
      setWalletNetwork(nextWalletNetwork);
      setMessage({ type: "success", text: "The wallet mascot received the Freighter public key." });
    } catch (error) {
      const reason =
        error instanceof Error && error.message
          ? error.message
          : "Connection request was rejected or could not be completed.";
      setMessage({ type: "error", text: reason });
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="wallet"
        eyebrow="Wallet mascot"
        title="Freighter Connect"
        description="The wallet mascot watches for Freighter, asks for a public key, and explains what happened without asking for secrets."
      />
      <Card className="space-y-5">
        {!detecting && !available ? (
          <div className="space-y-4">
            <p className="text-sm text-[#5d6b82]">
              Freighter is a Stellar browser wallet. Install it to connect your wallet and try the examples on this page.
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-[#5d6b82]">
              <li>
                Open the{" "}
                <a
                  href="https://chrome.google.com/webstore/detail/freighter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#178fb5] hover:text-[#0f6d8c]"
                >
                  Chrome Web Store
                </a>{" "}
                and add Freighter to your browser.
              </li>
              <li>Pin the extension to your toolbar for quick access.</li>
              <li>Create a new wallet or import an existing one using your Stellar secret key.</li>
              <li>Refresh this page — the wallet mascot will detect Freighter automatically.</li>
            </ol>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-semibold text-[#178fb5] hover:text-[#0f6d8c]"
            >
              Visit Freighter website →
            </a>
          </div>
        ) : (
          <>
            <Button type="button" onClick={connect} disabled={!available || connected}>
              {connected ? "Wallet connected" : "Ask wallet mascot to connect"}
            </Button>
            {publicKey ? (
              <div className="rounded-lg border border-white/80 bg-white/68 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">Connected public key</p>
                <p className="mt-2 break-all text-sm text-[#29364d]">{publicKey}</p>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/80 bg-white/60 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">Extension</p>
                <p className="mt-2 text-sm text-[#29364d]">{available ? "Detected" : "Not detected"}</p>
              </div>
              <div className="rounded-lg border border-white/80 bg-white/60 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">Permission</p>
                <p className="mt-2 text-sm text-[#29364d]">{connected ? "Allowed" : "Not allowed"}</p>
              </div>
              <div className="rounded-lg border border-white/80 bg-white/60 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">Wallet network</p>
                <p className="mt-2 text-sm text-[#29364d]">{walletNetwork || "Unknown"}</p>
              </div>
            </div>
          </>
        )}
      </Card>
      <StatusMessage type={message.type} title="Wallet mascot status" description={message.text} />
      {networkMismatch ? (
        <StatusMessage
          type="warning"
          title="Network mismatch"
          description={`The app is set to ${network}, but Freighter reports ${walletNetwork}. Switch one of them before testing wallet-driven workflows.`}
        />
      ) : (
        <StatusMessage
          type="info"
          title="Network check"
          description={
            walletNetwork
              ? `The app network is ${network}; Freighter reports ${walletNetwork}.`
              : "Freighter network will appear here when the extension exposes it."
          }
        />
      )}
    </div>
  );
}
