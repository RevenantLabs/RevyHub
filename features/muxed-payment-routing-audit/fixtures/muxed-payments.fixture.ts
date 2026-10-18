import { baseAccount, common, issuerAccount, muxedAddress } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
export const muxedPayments = [
  { ...common, paging_token: "104", type: "payment", to: baseAccount, to_muxed: muxedAddress(7n), to_muxed_id: "7", amount: "9007199254740993.0000001", asset_type: "credit_alphanum4", asset_code: "USD", asset_issuer: issuerAccount },
  { ...common, paging_token: "103", type: "path_payment_strict_receive", to: baseAccount, to_muxed: muxedAddress(7n), to_muxed_id: "7", amount: "0.0000001", asset_type: "credit_alphanum4", asset_code: "USD", asset_issuer: issuerAccount },
  { ...common, paging_token: "102", type: "payment", to: baseAccount, to_muxed: muxedAddress(9n), to_muxed_id: "9", amount: "3.0000000" }
];
