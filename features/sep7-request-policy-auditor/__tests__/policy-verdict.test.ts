import { expect, it } from "vitest";
import { buildVerdicts } from "../lib/policy-verdict";
import { parseSep7Uri } from "../lib/uri-fields";
import { blockedCallbackUri, deniedDestinationUri, hugeAmountUri, publicNetworkUri, wrongAssetUri } from "../fixtures/payment-uris.fixture";
import { samplePolicy, sampleUri } from "../fixtures/sep7RequestPolicyAuditor.fixture";
import { errorCopy } from "../copy";

function verdict(uri: string, field: string) {
  const fields = parseSep7Uri(uri);
  if (!fields.ok) throw new Error(fields.code);
  return buildVerdicts(fields.value, samplePolicy).find((item) => item.field === field);
}

it("passes the sample and fails destination, amount, network, asset and callback independently", () => {
  expect(verdict(sampleUri, "destination")?.passed).toBe(true);
  expect(verdict(deniedDestinationUri, "destination")?.code).toBe("destination_denied");
  expect(verdict(hugeAmountUri, "amount")?.code).toBe("amount_out_of_range");
  expect(verdict(publicNetworkUri, "network_passphrase")?.code).toBe("network_denied");
  expect(verdict(wrongAssetUri, "asset")?.code).toBe("asset_denied");
  expect(verdict(blockedCallbackUri, "callback")?.code).toBe("callback_blocked");
  expect(errorCopy.destination_denied.description).toContain("allowlist");
  expect(errorCopy.amount_out_of_range.description).toContain("stroop");
  expect(errorCopy.network_denied.description).toContain("passphrase");
});
