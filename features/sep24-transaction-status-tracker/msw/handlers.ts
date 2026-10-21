import { http, HttpResponse } from "msw";
import {
  pendingDeposit,
  toml,
  tomlUrl,
  transactionId,
  transferServer
} from "@/features/sep24-transaction-status-tracker/fixtures/sep24TransactionStatusTracker.fixture";

export const handlers = [
  http.get(tomlUrl, () => HttpResponse.text(toml)),
  http.get(`${transferServer}/transactions/${transactionId}`, () => HttpResponse.json(pendingDeposit))
];
