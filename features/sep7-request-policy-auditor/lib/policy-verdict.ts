import type { Policy, Sep7Fields, Verdict } from "../types";
import { callbackHost } from "./uri-fields";
import { toStroops } from "./policy-rules";

export function buildVerdicts(fields: Sep7Fields, policy: Policy): Verdict[] {
  const destinationOk = policy.destinations.includes(fields.destination);
  const min = toStroops(policy.minAmount);
  const max = toStroops(policy.maxAmount);
  const amount = fields.amount ? toStroops(fields.amount) : null;
  const amountOk = amount !== null && min !== null && max !== null && amount >= min && amount <= max;
  const networkOk = policy.passphrases.includes(fields.networkPassphrase);
  const host = callbackHost(fields.callback);
  const callbackOk = !fields.callback || (host !== null && policy.callbackHosts.includes(host));
  const assetOk = assetAllowed(fields, policy);
  const memoOk = !policy.memos.length || !fields.memo || policy.memos.includes(fields.memo);
  return [
    {
      field: "destination",
      passed: destinationOk,
      code: destinationOk ? "ok" : "destination_denied",
      advice: destinationOk ? "Destination is on the local allowlist." : "Add this destination to the local allowlist or refuse the request."
    },
    {
      field: "amount",
      passed: amountOk,
      code: amountOk ? "ok" : "amount_out_of_range",
      advice: amountOk ? "Amount is inside the configured stroop range." : "Change the amount so it sits between the policy minimum and maximum."
    },
    {
      field: "network_passphrase",
      passed: networkOk,
      code: networkOk ? "ok" : "network_denied",
      advice: networkOk ? "Passphrase is allowed by this policy." : "The request names a network passphrase that this policy does not allow."
    },
    {
      field: "asset",
      passed: assetOk,
      code: assetOk ? "ok" : "asset_denied",
      advice: assetOk ? "Asset code and issuer match the policy, or the policy allows any asset." : "The asset code and issuer are not on the policy list. Native XLM uses an empty issuer."
    },
    {
      field: "memo",
      passed: memoOk,
      code: memoOk ? "ok" : "memo_denied",
      advice: memoOk ? "Memo is allowed, or the policy does not restrict memos." : "Replace the memo with one listed in the local policy."
    },
    {
      field: "callback",
      passed: callbackOk,
      code: callbackOk ? "ok" : "callback_blocked",
      advice: callbackOk ? "Callback host is allowed, or no callback was requested." : "Remove the callback or allow its host. This tool does not open the URL."
    }
  ];
}

function assetAllowed(fields: Sep7Fields, policy: Policy): boolean {
  if (!policy.assets.length) return true;
  const code = fields.assetCode || "XLM";
  const issuer = fields.assetIssuer;
  return policy.assets.some((asset) => asset.code === code && asset.issuer === issuer);
}
