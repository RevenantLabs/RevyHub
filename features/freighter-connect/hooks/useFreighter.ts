"use client";

import { useCallback, useEffect, useState } from "react";
import { readWallet, requestAccess } from "@/features/freighter-connect/lib/freighter";
import type {
  FreighterErrorCode,
  WalletSnapshot
} from "@/features/freighter-connect/types";

export type FreighterState =
  | { status: "checking" }
  | { status: "ready"; snapshot: WalletSnapshot }
  | { status: "error"; code: FreighterErrorCode };

function toState(
  result: Awaited<ReturnType<typeof readWallet>>
): FreighterState {
  return result.ok
    ? { status: "ready", snapshot: result.value }
    : { status: "error", code: result.code };
}

export function useFreighter() {
  // The first render is already "checking", so the mount effect below only has
  // to publish the answer — it never sets state synchronously.
  const [state, setState] = useState<FreighterState>({ status: "checking" });

  useEffect(() => {
    let active = true;

    // The extension injects itself asynchronously, so the wallet cannot be
    // read during render.
    void readWallet().then((result) => {
      if (active) setState(toState(result));
    });

    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setState({ status: "checking" });
    setState(toState(await readWallet()));
  }, []);

  const connect = useCallback(async () => {
    setState({ status: "checking" });
    setState(toState(await requestAccess()));
  }, []);

  return { state, refresh, connect };
}
