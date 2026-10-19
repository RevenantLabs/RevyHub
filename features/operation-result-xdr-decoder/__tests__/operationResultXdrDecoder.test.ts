import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { runOperationResultXdrDecoder as run } from "../lib/operationResultXdrDecoder";
import { handlers } from "../msw/handlers";
import { successHash, missingHash, malformedHash, unsupportedHash, rateLimitedHash, requestFailedHash } from "../fixtures/operationResultXdrDecoder.fixture";
import { partialHash, preOperationHash } from "../fixtures/partial-failure.fixture";
import { feeBumpHash } from "../fixtures/fee-bump-result.fixture";
withMswHandlers(...handlers);
const lookup = (hash: string) => run({ hash }, "testnet");
describe("settled transaction decoding", () => {
  it("rejects an invalid hash before making a request", async () => {
    resetHorizonClients();
    expect(await lookup("not-a-hash")).toEqual({ ok: false, code: "invalid_hash" });
  });
  it("explains a successful operation", async () => { resetHorizonClients(); expect(await lookup(successHash)).toMatchObject({ ok: true, value: { verdict: "success", operations: [{ type: "bump_sequence", result: { code: "bump_sequence_success" } }] } }); });
  it("separates operation failure from pre-operation rejection", async () => { resetHorizonClients(); expect(await lookup(partialHash)).toMatchObject({ ok: true, value: { verdict: "operation_failure", operations: [{ result: { code: "bump_sequence_success" } }, { result: { code: "payment_underfunded" } }] } }); expect(await lookup(preOperationHash)).toMatchObject({ ok: true, value: { verdict: "pre_operation_failure", operations: [] } }); });
  it("unpacks fee bump before explaining the payment", async () => { resetHorizonClients(); expect(await lookup(feeBumpHash)).toMatchObject({ ok: true, value: { outer: { code: "tx_fee_bump_inner_failed" }, transaction: { code: "tx_failed" }, operations: [{ result: { code: "payment_underfunded" } }] } }); });
  it.each([[missingHash, "transaction_not_found"], [malformedHash, "malformed_result_xdr"], [unsupportedHash, "unsupported_operation"], [rateLimitedHash, "rate_limited"], [requestFailedHash, "request_failed"]])("maps expected failure %s", async (hash, code) => { resetHorizonClients(); expect(await lookup(hash)).toEqual({ ok: false, code }); });
});
