"use client";

import { useCallback, useRef, useState } from "react";
import { isErr } from "@/core/result/result";
import { readCsvFile } from "@/features/payment-csv-preflight/lib/paymentCsvPreflight.errors";
import { runPreflight } from "@/features/payment-csv-preflight/lib/paymentCsvPreflight";
import { parsePreflightInput } from "@/features/payment-csv-preflight/schema";
import type {
  PreflightErrorCode,
  PreflightReport,
  PreflightSource
} from "@/features/payment-csv-preflight/types";

export type PaymentCsvPreflightState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: PreflightReport; source: PreflightSource }
  | { status: "error"; code: PreflightErrorCode; detail?: number };

export function usePaymentCsvPreflight() {
  const [state, setState] = useState<PaymentCsvPreflightState>({ status: "idle" });

  /**
   * Identifies the submission currently allowed to write state.
   *
   * Reading a file is asynchronous, so a second submission can start while the
   * first is still reading. Every write checks its own id, which means a slow
   * earlier read can never overwrite a newer result — the failure mode where a
   * user sees totals belonging to a file they already replaced.
   */
  const submissionId = useRef(0);

  const evaluate = useCallback((id: number, csv: string, source: PreflightSource) => {
    const parsed = parsePreflightInput(csv);

    if (isErr(parsed)) {
      if (id === submissionId.current) setState({ status: "error", code: parsed.code });
      return;
    }

    const report = runPreflight(parsed.value);

    if (id !== submissionId.current) return;

    if (isErr(report)) {
      setState({
        status: "error",
        code: report.code,
        ...(typeof report.detail === "number" ? { detail: report.detail } : {})
      });
      return;
    }

    setState({ status: "success", report: report.value, source });
  }, []);

  const submitText = useCallback(
    (raw: string) => {
      submissionId.current += 1;
      evaluate(submissionId.current, raw, { kind: "text" });
    },
    [evaluate]
  );

  const submitFile = useCallback(
    async (file: File) => {
      submissionId.current += 1;
      const id = submissionId.current;

      setState({ status: "loading" });

      const read = await readCsvFile(file);

      if (id !== submissionId.current) return;

      if (isErr(read)) {
        setState({ status: "error", code: read.code });
        return;
      }

      evaluate(id, read.value, { kind: "file", name: file.name });
    },
    [evaluate]
  );

  const reset = useCallback(() => {
    submissionId.current += 1;
    setState({ status: "idle" });
  }, []);

  return { state, submitText, submitFile, reset };
}
