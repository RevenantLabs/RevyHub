import { http, HttpResponse } from "msw";
import { HORIZON_URLS } from "@/core/network/config";
import {
  accountRecord,
  issuerId,
  regulatedToml,
  tomlUrl
} from "@/features/regulated-asset-inspector/fixtures/regulatedAssetInspector.fixture";

const horizon = HORIZON_URLS.testnet;

export const handlers = [
  http.get(`${horizon}/accounts/${issuerId}`, () => HttpResponse.json(accountRecord)),
  http.get(tomlUrl, () => HttpResponse.text(regulatedToml))
];
