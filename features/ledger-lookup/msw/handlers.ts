import { http, HttpResponse } from "msw";
import { horizonUrl } from "@/core/horizon/client";
import { ledgerLookupFixture, rootFixture } from "../fixtures/ledgerLookup.fixture";
export const handlers = [http.get(horizonUrl("testnet", "/"), () => HttpResponse.json(rootFixture)), http.get(horizonUrl("testnet", "/ledgers/900"), () => HttpResponse.json(ledgerLookupFixture))];
