import { http, HttpResponse } from "msw";
import {
  sourceAccountId,
  transactionSourceAccountId,
  altSourceAccountId
} from "@/features/multisig-analyzer/fixtures/multisigAnalyzer.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

/** Request mocks used by this slice's tests. Keep responses realistic. */
export const handlers = [
  http.get(`${TESTNET}/accounts/${sourceAccountId}`, () =>
    HttpResponse.json({
      account_id: sourceAccountId,
      id: sourceAccountId,
      thresholds: { low_threshold: 1, med_threshold: 3, high_threshold: 5 },
      signers: [
        { key: sourceAccountId, weight: 1, type: "ed25519_public_key" },
        { key: transactionSourceAccountId, weight: 2, type: "ed25519_public_key" },
        { key: altSourceAccountId, weight: 2, type: "ed25519_public_key" }
      ]
    })
  ),
  http.get(`${TESTNET}/accounts/${transactionSourceAccountId}`, () =>
    HttpResponse.json({
      account_id: transactionSourceAccountId,
      id: transactionSourceAccountId,
      thresholds: { low_threshold: 1, med_threshold: 3, high_threshold: 5 },
      signers: [
        { key: sourceAccountId, weight: 1, type: "ed25519_public_key" },
        { key: transactionSourceAccountId, weight: 2, type: "ed25519_public_key" },
        { key: altSourceAccountId, weight: 2, type: "ed25519_public_key" }
      ]
    })
  ),
  http.get(`${TESTNET}/accounts/:accountId`, ({ params }) => {
    const { accountId } = params;
    if (accountId === "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") {
      return HttpResponse.json(
        {
          type: "https://stellar.org/horizon-errors/not_found",
          title: "Resource Missing",
          status: 404
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({});
  })
];
