import { http, HttpResponse } from "msw";
import { horizonUrl } from "@/core/horizon/client";
import { rootFixture, testnetLedger, mainnetLedger } from "../fixtures/networkComparison.fixture";
export const handlers = (["testnet","mainnet"] as const).flatMap(network => [
 http.get(horizonUrl(network,"/"),()=>HttpResponse.json(network === "testnet" ? rootFixture : {...rootFixture,core_latest_ledger:60000000,history_latest_ledger:60000000})),
 http.get(horizonUrl(network,"/ledgers"),()=>HttpResponse.json({_embedded:{records:[network === "testnet" ? testnetLedger : mainnetLedger]}}))
]);
