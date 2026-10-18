import { accountA, accountB, accountC, issuerA } from "./multiAccountAssetExposure.fixture";
import type { AccountRow } from "../types";
/** One missing account cannot erase the two observed balances. */
export const partialFailureAccounts: AccountRow[] = [
  { accountId: accountA, status: "success", balances: [
    { kind: "credit", code: "USD", issuer: issuerA, balance: "1.1" }
  ] },
  { accountId: accountB, status: "error", code: "account_not_found" },
  { accountId: accountC, status: "success", balances: [
    { kind: "credit", code: "USD", issuer: issuerA, balance: "0.9" }
  ] }
];
