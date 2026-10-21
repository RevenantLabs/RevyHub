import { http, HttpResponse } from "msw";
import {
  assetCode,
  holderAccountId,
  holderAccountResponse,
  issuerAccountId,
  issuerAccountResponse,
  noTrustlineHolderId,
  rateLimitedAccountId,
  unknownAccountId
} from "../fixtures/clawbackEligibilityChecker.fixture";
import { eligibleHolderId, eligibleIssuerId, eligibleAssetCode } from "../fixtures/eligible-trustline.fixture";
import {
  disagreeingAssetCode,
  disagreeingHolderId,
  disagreeingIssuerId
} from "../fixtures/disagreeing-signals.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

const accounts: Record<string, unknown> = {
  [issuerAccountId]: issuerAccountResponse(issuerAccountId, false),
  [holderAccountId]: holderAccountResponse(holderAccountId, issuerAccountId, assetCode, false),
  [noTrustlineHolderId]: holderAccountResponse(noTrustlineHolderId, issuerAccountId, assetCode, null),

  [eligibleIssuerId]: issuerAccountResponse(eligibleIssuerId, true),
  [eligibleHolderId]: holderAccountResponse(eligibleHolderId, eligibleIssuerId, eligibleAssetCode, true),

  [disagreeingIssuerId]: issuerAccountResponse(disagreeingIssuerId, true),
  [disagreeingHolderId]: holderAccountResponse(disagreeingHolderId, disagreeingIssuerId, disagreeingAssetCode, false)
};

export const handlers = [
  http.get(`${TESTNET}/accounts/:accountId`, ({ params }) => {
    const accountId = params.accountId as string;
    if (accountId === unknownAccountId) {
      return HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 });
    }
    if (accountId === rateLimitedAccountId) {
      return HttpResponse.json({ title: "Rate Limit Exceeded", status: 429 }, { status: 429 });
    }
    const account = accounts[accountId];
    if (!account) return HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 });
    return HttpResponse.json(account);
  })
];
