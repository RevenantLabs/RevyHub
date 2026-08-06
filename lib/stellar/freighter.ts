import type { StellarNetwork } from "./horizon";

export interface FreighterApiShape {
  isConnected?: () => Promise<boolean>;
  isAllowed?: () => Promise<boolean>;
  getPublicKey?: () => Promise<string>;
  getNetwork?: () => Promise<string>;
}

declare global {
  interface Window {
    freighterApi?: FreighterApiShape;
  }
}

export type FreighterNetworkKind = "testnet" | "mainnet" | "unsupported" | "unavailable";

export interface FreighterNetworkResult {
  kind: FreighterNetworkKind;
  label: string;
}

export type WalletNetworkStatus = "match" | "mismatch" | "unsupported" | "unavailable";

export function getFreighterApi(): FreighterApiShape | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.freighterApi ?? null;
}

export function normalizeFreighterNetwork(value: string): FreighterNetworkResult {
  const trimmed = value.trim();
  const normalized = trimmed.toLowerCase();

  if (normalized === "") {
    return { kind: "unavailable", label: "" };
  }

  if (normalized.includes("test")) {
    return { kind: "testnet", label: "testnet" };
  }

  if (normalized.includes("public") || normalized.includes("main")) {
    return { kind: "mainnet", label: "mainnet" };
  }

  return { kind: "unsupported", label: trimmed };
}

export async function readFreighterNetwork(api: FreighterApiShape | null): Promise<FreighterNetworkResult> {
  if (!api?.getNetwork) {
    return { kind: "unavailable", label: "" };
  }

  try {
    return normalizeFreighterNetwork(await api.getNetwork());
  } catch {
    return { kind: "unavailable", label: "" };
  }
}

export function walletNetworkStatus(
  result: FreighterNetworkResult,
  appNetwork: StellarNetwork
): WalletNetworkStatus {
  if (result.kind === "unavailable") {
    return "unavailable";
  }

  if (result.kind === "unsupported") {
    return "unsupported";
  }

  return result.kind === appNetwork ? "match" : "mismatch";
}

export function watchFreighterNetwork(
  getApi: () => FreighterApiShape | null,
  onChange: (result: FreighterNetworkResult) => void,
  intervalMs = 3000
): () => void {
  let active = true;
  let timer: ReturnType<typeof setInterval> | null = null;

  const read = async () => {
    if (!active) {
      return;
    }

    const result = await readFreighterNetwork(getApi());
    if (active) {
      onChange(result);
    }
  };

  void read();
  timer = setInterval(() => void read(), intervalMs);

  return () => {
    active = false;
    if (timer !== null) {
      clearInterval(timer);
    }
  };
}
