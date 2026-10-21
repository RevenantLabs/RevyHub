"use client";

import { useCallback, useRef, useState } from "react";
import type { StellarNetwork } from "@/core/network/types";
import { useNetwork } from "@/core/network/NetworkProvider";
import { runSigningPayloadInspector } from "@/features/signing-payload-inspector/lib/signingPayloadInspector";
import type { SigningPayloadInspectorState } from "@/features/signing-payload-inspector/types";

export function useSigningPayloadInspector() {
  const { network: initialNetwork } = useNetwork();
  const [selectedNetwork, setSelectedNetwork] = useState<StellarNetwork>(initialNetwork);
  const [state, setState] = useState<SigningPayloadInspectorState>({ status: "idle" });
  const generation = useRef(0);

  const submit = useCallback((raw: string) => {
    const current = ++generation.current;
    setState({ status: "loading" });
    // Yield once so local processing exposes a real loading state without a timer.
    void Promise.resolve().then(() => {
      if (current !== generation.current) return;
      const result = runSigningPayloadInspector(raw, selectedNetwork);
      if (current !== generation.current) return;
      setState(result.ok
        ? { status: "success", result: result.value }
        : { status: "error", code: result.code });
    });
  }, [selectedNetwork]);

  const changeNetwork = useCallback((network: StellarNetwork) => {
    ++generation.current;
    setSelectedNetwork(network);
    setState({ status: "idle" });
  }, []);

  const reset = useCallback(() => {
    ++generation.current;
    setState({ status: "idle" });
  }, []);

  return { state, selectedNetwork, submit, changeNetwork, reset };
}
