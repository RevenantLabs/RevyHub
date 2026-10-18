import { http, HttpResponse } from "msw";
import {
  balanceId,
  claimantAccount,
  claimantListPage,
  emptyClaimantListPage,
  missingBalanceId,
  nestedPredicateBalance
} from "@/features/claimable-balances/fixtures/claimableBalances.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/claimable_balances`, ({ request }) => {
    const url = new URL(request.url);
    const claimant = url.searchParams.get("claimant");

    if (claimant === claimantAccount) {
      return HttpResponse.json(claimantListPage);
    }

    return HttpResponse.json(emptyClaimantListPage);
  }),
  http.get(`${TESTNET}/claimable_balances/${balanceId}`, () =>
    HttpResponse.json(nestedPredicateBalance)
  ),
  http.get(`${TESTNET}/claimable_balances/${missingBalanceId}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];
