import { err, ok, type Result } from "@/core/result/result";
import { fetchSep24Transaction } from "@/features/sep24-transaction-status-tracker/lib/sep24-status-fetch";
import { explainStatus } from "@/features/sep24-transaction-status-tracker/lib/status-explanations";
import {
  readTransferServer,
  stellarTomlUrl
} from "@/features/sep24-transaction-status-tracker/lib/transfer-server-resolve";
import type {
  Sep24TransactionStatusTrackerErrorCode,
  Sep24TransactionStatusTrackerInput,
  Sep24TransactionStatusTrackerResult
} from "@/features/sep24-transaction-status-tracker/types";

export interface TrackerDeps {
  fetchImpl?: typeof fetch;
}

export async function runSep24TransactionStatusTracker(
  input: Sep24TransactionStatusTrackerInput,
  signal?: AbortSignal,
  deps: TrackerDeps = {}
): Promise<Result<Sep24TransactionStatusTrackerResult, Sep24TransactionStatusTrackerErrorCode>> {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  const tomlUrl = stellarTomlUrl(input.homeDomain);
  let toml: string;
  try {
    const response = await fetchImpl(tomlUrl, { signal, redirect: "manual" });
    if (!response.ok || (response.status >= 300 && response.status < 400)) return err("request_failed");
    toml = await response.text();
  } catch {
    return err("request_failed");
  }

  const server = readTransferServer(toml);
  if (!server.ok) return err(server.code);

  const transaction = await fetchSep24Transaction(
    server.value,
    input.transactionId,
    input.token,
    fetchImpl,
    signal
  );
  if (!transaction.ok) return err(transaction.code);

  const explanation = explainStatus(transaction.value.status);
  return ok({
    homeDomain: input.homeDomain,
    transferServer: server.value,
    transactionId: transaction.value.id,
    kind: transaction.value.kind,
    status: transaction.value.status,
    explanation: explanation.explanation,
    nextStep: explanation.nextStep,
    amountIn: transaction.value.amountIn,
    amountOut: transaction.value.amountOut,
    amountFee: transaction.value.amountFee,
    moreInfoUrl: transaction.value.moreInfoUrl
  });
}
