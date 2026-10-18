"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { isErr } from "@/core/result/result";
import { FIELD_OF_CODE, parseOperationBrowserInput } from "@/features/operation-browser/schema";
import {
  loadNewerOperationPage,
  loadOlderOperationPage,
  runOperationBrowser
} from "@/features/operation-browser/lib/operationBrowser";
import type {
  OperationBrowserErrorCode,
  OperationBrowserField,
  OperationBrowserResult
} from "@/features/operation-browser/types";

export type OperationBrowserState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: OperationBrowserResult; paging: "idle" | "older" | "newer" }
  | { status: "error"; code: OperationBrowserErrorCode; field: OperationBrowserField | null };

const IDLE: OperationBrowserState = { status: "idle" };

interface Held {
  state: OperationBrowserState;
  network: StellarNetwork;
}

export function useOperationBrowser() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseOperationBrowserInput(raw);

      if (isErr(parsed)) {
        setHeld({
          state: { status: "error", code: parsed.code, field: FIELD_OF_CODE[parsed.code] },
          network
        });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await runOperationBrowser(parsed.value, network, next.signal);
      if (next.signal.aborted) return;

      setHeld({
        state: result.ok
          ? { status: "success", result: result.value, paging: "idle" }
          : { status: "error", code: result.code, field: FIELD_OF_CODE[result.code] },
        network
      });
    },
    [network]
  );

  const loadOlder = useCallback(async () => {
    if (state.status !== "success") return;

    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setHeld({
      state: { ...state, paging: "older" },
      network
    });

    const result = await loadOlderOperationPage(state.result, network, next.signal);
    if (next.signal.aborted) return;

    setHeld({
      state: result.ok
        ? { status: "success", result: result.value, paging: "idle" }
        : { status: "error", code: result.code, field: FIELD_OF_CODE[result.code] },
      network
    });
  }, [network, state]);

  const loadNewer = useCallback(() => {
    if (state.status !== "success" || state.result.pageIndex === 0) return;
    setHeld({
      state: {
        status: "success",
        result: loadNewerOperationPage(state.result),
        paging: "newer"
      },
      network
    });
  }, [network, state]);

  const setTypeFilter = useCallback(
    (typeFilter: string) => {
      if (state.status !== "success") return;
      setHeld({
        state: {
          status: "success",
          result: { ...state.result, typeFilter },
          paging: "idle"
        },
        network
      });
    },
    [network, state]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, loadOlder, loadNewer, setTypeFilter, reset };
}
