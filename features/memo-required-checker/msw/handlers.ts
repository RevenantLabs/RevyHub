import { http, HttpResponse } from "msw";
import { HORIZON_URLS } from "@/core/network/config";
import {
  accountId,
  accountRecord,
  requiredToml,
  tomlUrl
} from "@/features/memo-required-checker/fixtures/memoRequiredChecker.fixture";

export const handlers = [
  http.get(`${HORIZON_URLS.testnet}/accounts/${accountId}`, () => HttpResponse.json(accountRecord())),
  http.get(tomlUrl, () => HttpResponse.text(requiredToml))
];
