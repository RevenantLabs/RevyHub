import { expect, it } from "vitest";
import { explainCode, formatCode, formatFee, formatOperation } from "../lib/format";
it("formats the exact result and fee labels", () => { expect(formatCode("payment_underfunded")).toBe("payment underfunded"); expect(formatFee("9223372036854775807")).toBe("9223372036854775807 stroops"); expect(formatOperation(1, "bump_sequence")).toBe("2. bump sequence"); });
it("uses atomic transaction language for tx_failed", () => expect(explainCode("tx_failed").explanation).toContain("none of the transaction's operations were applied"));
it("explains payment failures using documented meanings", () => expect(explainCode("payment_underfunded").explanation).toContain("not have enough"));
it("explains common operation failures specifically", () => expect(explainCode("op_bad_auth").explanation).toContain("valid signatures"));
it("explains path limits, offer sides, and Soroban resource failures", () => {
  expect(explainCode("path_payment_strict_receive_too_few_offers", "path_payment_strict_receive").explanation).toContain("too few offers");
  expect(explainCode("manage_buy_offer_buy_no_trust", "manage_buy_offer").explanation).toContain("buying asset");
  expect(explainCode("invoke_host_function_resource_limit_exceeded", "invoke_host_function").explanation).toContain("Soroban resource limit");
});
