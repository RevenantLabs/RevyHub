"use client";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Button } from "@/core/ui/Button";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "../copy";
import { exportExposureCsv } from "../lib/csv-export";
import type { MultiAccountAssetExposureResult as Exposure } from "../types";
import { AccountStatus } from "./AccountStatus";
import { ExposureMatrix } from "./ExposureMatrix";
import { AssetTotals } from "./AssetTotals";
export function MultiAccountAssetExposureResult({ result }: { result: Exposure }) {
  function download() {
    const blob = new Blob([exportExposureCsv(result)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = copy.csvFilename;
    link.click();
    URL.revokeObjectURL(url);
  }
  return <Card>
    <CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
    <div className="space-y-6">
      {result.accounts.some((account) => account.status === "error") &&
        <StatusMessage type="warning" title={copy.partialNotice} />}
      <AccountStatus accounts={result.accounts} />
      <ExposureMatrix result={result} />
      <AssetTotals rows={result.matrix} />
      <Button type="button" onClick={download}>{copy.export}</Button>
    </div>
  </Card>;
}
