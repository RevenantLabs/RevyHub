export interface FreighterApi {
  isConnected?: () => Promise<boolean>;
  isAllowed?: () => Promise<boolean>;
  getPublicKey?: () => Promise<string>;
  getNetwork?: () => Promise<string>;
  addAccountListener?: (callback: (account: string) => void) => void;
  removeAccountListener?: (callback: (account: string) => void) => void;
}

export interface FreighterAccountState {
  connected: boolean;
  publicKey: string;
  walletNetwork: string;
}

export const FREIGHTER_ACCOUNT_POLL_MS = 2000;

export function accountFromListenerEvent(account: string): Pick<FreighterAccountState, "connected" | "publicKey"> {
  const publicKey = account.trim();

  if (!publicKey) {
    return { connected: false, publicKey: "" };
  }

  return { connected: true, publicKey };
}

export async function readFreighterAccountState(api: FreighterApi): Promise<FreighterAccountState> {
  const isConnected = api.isConnected ? await api.isConnected().catch(() => false) : false;
  const isAllowed = api.isAllowed ? await api.isAllowed().catch(() => false) : false;
  const connected = isConnected || isAllowed;

  if (!connected) {
    return { connected: false, publicKey: "", walletNetwork: "" };
  }

  if (!api.getPublicKey) {
    return { connected: true, publicKey: "", walletNetwork: "" };
  }

  let publicKey = "";

  try {
    publicKey = (await api.getPublicKey()).trim();
  } catch {
    return { connected: false, publicKey: "", walletNetwork: "" };
  }

  if (!publicKey) {
    return { connected: false, publicKey: "", walletNetwork: "" };
  }

  const walletNetwork = api.getNetwork ? await api.getNetwork().catch(() => "") : "";

  return { connected: true, publicKey, walletNetwork };
}

export function subscribeFreighterAccountChanges(
  api: FreighterApi,
  onUpdate: (state: FreighterAccountState) => void
): () => void {
  let disposed = false;
  let lastSnapshot = "";

  const emitIfChanged = (state: FreighterAccountState) => {
    const snapshot = `${state.connected}:${state.publicKey}:${state.walletNetwork}`;

    if (snapshot === lastSnapshot) {
      return;
    }

    lastSnapshot = snapshot;
    onUpdate(state);
  };

  const refreshFromWallet = () => {
    if (disposed) {
      return;
    }

    void readFreighterAccountState(api).then((state) => {
      if (!disposed) {
        emitIfChanged(state);
      }
    });
  };

  const listener = (account: string) => {
    if (disposed) {
      return;
    }

    const next = accountFromListenerEvent(account);
    emitIfChanged({
      connected: next.connected,
      publicKey: next.publicKey,
      walletNetwork: ""
    });

    if (next.connected && api.getNetwork) {
      void api
        .getNetwork()
        .then((walletNetwork) => {
          if (!disposed && next.connected) {
            emitIfChanged({
              connected: true,
              publicKey: next.publicKey,
              walletNetwork
            });
          }
        })
        .catch(() => {});
    }
  };

  if (api.addAccountListener && api.removeAccountListener) {
    api.addAccountListener(listener);

    return () => {
      disposed = true;
      api.removeAccountListener?.(listener);
    };
  }

  refreshFromWallet();
  const pollTimer = setInterval(refreshFromWallet, FREIGHTER_ACCOUNT_POLL_MS);

  return () => {
    disposed = true;
    clearInterval(pollTimer);
  };
}
