import { accountA, accountB, accountC, issuerA, issuerB } from "./multiAccountAssetExposure.fixture";
import type { AccountRow } from "../types";
/** Same code from different issuers, an absent trustline, and zero balance. */
export const multipleAccounts: AccountRow[] = [
  { accountId: accountA, status: "success", balances: [
    { kind: "credit", code: "USD", issuer: issuerA, balance: "1.0000001" },
    { kind: "credit", code: "USD", issuer: issuerB, balance: "5" }
  ] },
  { accountId: accountB, status: "success", balances: [
    { kind: "credit", code: "USD", issuer: issuerA, balance: "2.9999999" }
  ] },
  { accountId: accountC, status: "success", balances: [
    { kind: "credit", code: "USD", issuer: issuerB, balance: "0" }
  ] }
];
