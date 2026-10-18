import { http, HttpResponse } from "msw";
import {
  balanceId,
  missingBalanceId,
  nestedPredicateBalance,
  noCreationBalanceId,
  noCreationContextBalance,
  relativeOnlyBalance,
  relativeOnlyBalanceId,
  unsupportedBalanceId,
  unsupportedPredicateBalance
} from "@/features/claimable-balance-readiness/fixtures/claimableBalanceReadiness.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/claimable_balances/${balanceId}`, () =>
    HttpResponse.json(nestedPredicateBalance)
  ),
  http.get(`${TESTNET}/claimable_balances/${relativeOnlyBalanceId}`, () =>
    HttpResponse.json(relativeOnlyBalance)
  ),
  http.get(`${TESTNET}/claimable_balances/${noCreationBalanceId}`, () =>
    HttpResponse.json(noCreationContextBalance)
  ),
  http.get(`${TESTNET}/claimable_balances/${unsupportedBalanceId}`, () =>
    HttpResponse.json(unsupportedPredicateBalance)
  ),
  http.get(`${TESTNET}/claimable_balances/${missingBalanceId}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];
