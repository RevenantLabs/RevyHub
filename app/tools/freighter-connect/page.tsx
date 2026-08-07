"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import {
  readFreighterAccountState,
  subscribeFreighterAccountChanges,
  type FreighterApi
} from "@/lib/wallet/freighterAccount";

declare global {
  interface Window {
    freighterApi?: FreighterApi;
  }
}

export function normalizeFreighterNetwork(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("test")) return "testnet";
  if (normalized.includes("public") || normalized.includes("main")) return "mainnet";

  return "unknown";
}

export const CLEAR_CONNECTION_MESSAGE =
  "Local Freighter display cleared. Extension permission is still managed in Freighter; reconnect anytime to request the public key again.";

function displayNetwork(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("test")) return "Testnet";
  if (normalized.includes("public") || normalized.includes("main")) return "Mainnet";

  return "Unknown";
}

// TODO(issue RevenantLabs/RevyHub#8): Add a network change listener so the wallet network refreshes automatically when the user switches Freighter networks.

export default function FreighterConnectPage() {
  const { network } = useNetwork();
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
    let unsubscribeAccountChanges: (() => void) | undefined;

    function applyWalletState(
      nextConnected: boolean,
      nextPublicKey: string,
      nextWalletNetwork: string,
      updateMessage = true
    ) {
      setConnected(nextConnected);
      setPublicKey(nextPublicKey);
      setWalletNetwork(nextWalletNetwork);

      if (!updateMessage) {
        return;
      }

      if (!nextConnected || !nextPublicKey) {
        setMessage({
          type: "info",
          text: "The wallet mascot lost access to the Freighter account. Connect again when you are ready."
        });
        return;
      }

      setMessage({
        type: "success",
        text: "The wallet mascot is synced with the active Freighter account."
      });
    }

    async function inspectFreighter() {
      const detected = Boolean(window.freighterApi);
      if (!active) return;

      setAvailable(detected);

      if (!detected) {
        applyWalletState(false, "", "");
        setMessage({
          type: "warning",
          text: "The wallet mascot could not find Freighter. Install the extension to try connection examples."
        });
        return;
      }

      const api = window.freighterApi!;
      const state = await readFreighterAccountState(api);

      if (!active) return;

      applyWalletState(state.connected, state.publicKey, state.walletNetwork, false);

      if (state.connected && state.publicKey) {
        setMessage({
          type: "success",
          text: "The wallet mascot can reach Freighter and the site is already allowed."
        });
      } else {
        setMessage({
          type: "info",
          text: "The wallet mascot spotted Freighter. You can request the public key."
        });
      }

      unsubscribeAccountChanges = subscribeFreighterAccountChanges(api, (nextState) => {
        if (!active) return;

        applyWalletState(nextState.connected, nextState.publicKey, nextState.walletNetwork);
      });
    }

    void inspectFreighter();

    return () => {
      active = false;
      unsubscribeAccountChanges?.();
    };
  }, []);

  async function connect() {
    if (!window.freighterApi?.getPublicKey) {
      setMessage({ type: "warning", text: "The wallet mascot cannot reach the Freighter API in this browser." });
      return;
    }

    try {
      const key = (await window.freighterApi.getPublicKey()).trim();
      const nextWalletNetwork = window.freighterApi.getNetwork
        ? await window.freighterApi.getNetwork().catch(() => "")
        : walletNetwork;
      setPublicKey(key);
      setConnected(true);
      setWalletNetwork(nextWalletNetwork);
      setMessage({ type: "success", text: "The wallet mascot received the Freighter public key." });
    } catch {
      setConnected(false);
      setPublicKey("");
      setWalletNetwork("");
      setMessage({ type: "error", text: "Connection request was rejected or could not be completed." });
    }
  }

  function clearLocalConnection() {
    setPublicKey("");
    setWalletNetwork("");
    setMessage({
      type: "info",
      text: CLEAR_CONNECTION_MESSAGE
    });
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
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={connect} disabled={!available}>
            Ask wallet mascot to connect
          </Button>
          {publicKey ? (
            <Button type="button" variant="secondary" onClick={clearLocalConnection}>
              Clear connection
            </Button>
          ) : null}
        </div>
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
            <div className="mt-2 flex items-center gap-2">
              <p className="text-sm text-[#29364d]">{walletNetwork ? displayNetwork(walletNetwork) : "Unknown"}</p>
              {walletNetwork ? (
                <Badge tone={networkMismatch ? "warning" : "success"}>
                  {networkMismatch ? "Mismatch" : "Match"}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <p className="text-xs text-[#4e5c73]">
          Clear connection only forgets the public key and network shown in this page. Freighter still manages
          extension permissions; revoke access from the Freighter extension if you want to remove site approval.
        </p>
        <a
          href="https://www.freighter.app/"
          className="inline-flex text-sm font-semibold text-[#178fb5] hover:text-[#0f6d8c]"
        >
          Install Freighter
        </a>
      </Card>
      <StatusMessage type={message.type} title="Wallet mascot status" description={message.text} />
      {networkMismatch ? (
        <StatusMessage
          type="warning"
          title="Network mismatch"
          description={`The app is set to ${network}, but Freighter reports ${displayNetwork(walletNetwork)}. Switch Freighter to ${network === "testnet" ? "TESTNET" : "Public"} to match the app network.`}
        />
      ) : available && walletNetwork ? (
        <StatusMessage
          type="info"
          title="Network check"
          description={`The app network is ${network}; Freighter reports ${displayNetwork(walletNetwork)}.`}
        />
      ) : null}
    </div>
  );
}
