import { err, ok, type Result } from "@/core/result/result";
import { FRIENDBOT_URL } from "@/core/network/config";
import { toFaucetErrorCode } from "@/features/testnet-faucet/lib/friendbot.errors";
import type {
  FaucetErrorCode,
  FaucetInput,
  FaucetSuccess
} from "@/features/testnet-faucet/types";

export function friendbotUrl(accountId: string): string {
  const url = new URL(FRIENDBOT_URL);
  url.searchParams.set("addr", accountId);
  return url.toString();
}

/**
 * Funds a testnet account.
 *
 * Friendbot only exists on testnet — there is deliberately no mainnet path
 * here, and the manifest declares `networks: ["testnet"]` for the same reason.
 */
export async function fundTestnetAccount(
  { accountId }: FaucetInput,
  signal?: AbortSignal
): Promise<Result<FaucetSuccess, FaucetErrorCode>> {
  let response: Response;

  try {
    response = await fetch(friendbotUrl(accountId), { signal });
  } catch (error) {
    return err(toFaucetErrorCode(error));
  }

  if (!response.ok) {
    return err(await classifyFriendbotResponse(response));
  }

  try {
    const body = (await response.json()) as { hash?: string; ledger?: number };
    return ok({ accountId, transactionHash: body.hash, ledger: body.ledger });
  } catch {
    // Friendbot succeeded but returned something we cannot parse. The account
    // is funded either way, so this is still a success.
    return ok({ accountId });
  }
}

/**
 * Friendbot answers 400 both for "already funded" and for genuinely bad
 * requests, so the body has to be inspected to tell them apart.
 */
export async function classifyFriendbotResponse(response: Response): Promise<FaucetErrorCode> {
  if (response.status === 429) return "rate_limited";
  if (response.status >= 500) return "friendbot_unavailable";

  if (response.status === 400) {
    let text = "";
    try {
      text = (await response.text()).toLowerCase();
    } catch {
      return "request_failed";
    }

    if (text.includes("createaccountalreadyexist") || text.includes("already")) {
      return "already_funded";
    }
    return "request_failed";
  }

  return "request_failed";
}
