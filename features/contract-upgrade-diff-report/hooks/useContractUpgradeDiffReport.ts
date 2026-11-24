"use client";

import { useCallback, useRef, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseWasmUpload, validateUpgradeFiles } from "@/features/contract-upgrade-diff-report/schema";
import { buildUpgradeReport } from "@/features/contract-upgrade-diff-report/lib/contractUpgradeDiffReport";
import { readUploadBytes } from "@/features/contract-upgrade-diff-report/lib/contractUpgradeDiffReport.errors";
import type {
  RawUpgradeFiles,
  UpgradeErrorCode,
  UpgradeReport,
  UpgradeSide
} from "@/features/contract-upgrade-diff-report/types";

export type ContractUpgradeDiffReportState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: UpgradeReport }
  | { status: "error"; code: UpgradeErrorCode; side?: UpgradeSide };

/**
 * Reads both files and builds the report, entirely in this browser.
 *
 * There is no network: the only asynchronous step is the file read, so the
 * loading state means "processing locally". A second submission can start
 * while the first is still reading, so every write checks the submission id
 * it started with and an obsolete read can never overwrite a newer result.
 */
export function useContractUpgradeDiffReport() {
  const [state, setState] = useState<ContractUpgradeDiffReportState>({ status: "idle" });
  const submissionId = useRef(0);

  const submit = useCallback(async (raw: RawUpgradeFiles) => {
    submissionId.current += 1;
    const id = submissionId.current;
    const current = () => id === submissionId.current;

    const validated = validateUpgradeFiles(raw);
    if (isErr(validated)) {
      setState({ status: "error", code: validated.code, side: validated.detail?.side });
      return;
    }

    setState({ status: "loading" });

    const [oldRead, newRead] = await Promise.all([
      readUploadBytes(validated.value.oldFile, "old"),
      readUploadBytes(validated.value.newFile, "new")
    ]);
    if (!current()) return;

    if (isErr(oldRead)) {
      setState({ status: "error", code: oldRead.code, side: "old" });
      return;
    }
    if (isErr(newRead)) {
      setState({ status: "error", code: newRead.code, side: "new" });
      return;
    }

    const oldUpload = parseWasmUpload(oldRead.value, validated.value.oldFile.name, "old");
    if (isErr(oldUpload)) {
      setState({ status: "error", code: oldUpload.code, side: "old" });
      return;
    }

    const newUpload = parseWasmUpload(newRead.value, validated.value.newFile.name, "new");
    if (isErr(newUpload)) {
      setState({ status: "error", code: newUpload.code, side: "new" });
      return;
    }

    const report = buildUpgradeReport({ old: oldUpload.value, new: newUpload.value });
    if (!current()) return;

    setState(
      report.ok
        ? { status: "success", report: report.value }
        : { status: "error", code: report.code, side: report.detail?.side }
    );
  }, []);

  const reset = useCallback(() => {
    // Invalidates any read still in flight as well as clearing the result.
    submissionId.current += 1;
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
