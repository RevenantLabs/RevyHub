import { getHorizonServer, getBaseReserve, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";
import type { DisplayBalance } from "@/components/stellar/BalanceList";

export interface MinimumBalanceEstimate {
  /** Network base reserve in XLM (fetched from latest ledger). */
  baseReserve: number;
  /** Number of account subentries (trustlines, offers, data entries, signers). */
  subentryCount: number;
  /** Number of entries this account is sponsoring for others. */
  numSponsoring: number;
  /** Number of entries sponsored by others for this account. */
  numSponsored: number;
  /** Ledger used as the data source. */
  lastModifiedLedger: number;
  /** Human-readable formula used. */
  formula: string;
  /** Minimum balance in XLM as decimal string. */
  minimumBalance: string;
  /** Current native (XLM) balance as decimal string. */
  nativeBalance: string;
  /** Estimated potentially spendable XLM (nativeBalance minus minimumBalance, floor 0). */
  potentiallySpendable: string;
}

export async function getAccountBalances(
  publicKey: string,
  network: StellarNetwork = STELLAR_NETWORK
): Promise<DisplayBalance[]> {
  const validation = validatePublicKey(publicKey);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  try {
    const account = await getHorizonServer(network).loadAccount(publicKey.trim());

    // TODO(issue #21): Return a typed account-not-found state so UI can link directly to the Testnet Faucet Helper.
    return account.balances.map((balance) => {
      if (balance.asset_type === "native") {
        return {
          assetCode: "XLM",
          amount: balance.balance
        };
      }

      if (balance.asset_type === "liquidity_pool_shares") {
        return {
          assetCode: "Liquidity pool shares",
          issuer: balance.liquidity_pool_id,
          amount: balance.balance
        };
      }

      return {
        assetCode: balance.asset_code,
        issuer: balance.asset_issuer,
        amount: balance.balance
      };
    });
  } catch (error) {
    const responseStatus = getResponseStatus(error);

    if (responseStatus === 404) {
      throw new Error(
        network === "testnet"
          ? "Account not found on Stellar testnet. Fund it with Friendbot first."
          : "Account not found on Stellar mainnet."
      );
    }

    throw new Error("Could not load account balances from Horizon. Try again in a moment.");
  }
}

export function getResponseStatus(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status;
  }

  return undefined;
}

/**
 * Estimate an account's minimum balance using network base-reserve data and the
 * account's subentry and sponsorship counts.
 *
 * Stellar minimum-balance formula:
 *   (2 + subentry_count + num_sponsoring - num_sponsored) × base_reserve
 */
export async function getMinimumBalance(
  publicKey: string,
  network: StellarNetwork = STELLAR_NETWORK
): Promise<MinimumBalanceEstimate> {
  const validation = validatePublicKey(publicKey);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const [account, baseReserve] = await Promise.all([
    getHorizonServer(network).loadAccount(publicKey.trim()),
    getBaseReserve(network)
  ]);

  // Safe fallbacks for Horizon responses that may lack sponsorship fields.
  // Use bracket notation because num_sponsoring / num_sponsored are not in the typed SDK yet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = account as any;
  const subentryCount = typeof raw.subentry_count === "number" ? (raw.subentry_count as number) : 0;
  const numSponsoring = typeof raw.num_sponsoring === "number" ? (raw.num_sponsoring as number) : 0;
  const numSponsored = typeof raw.num_sponsored === "number" ? (raw.num_sponsored as number) : 0;
  const lastModifiedLedger =
    typeof raw.last_modified_ledger === "number" ? (raw.last_modified_ledger as number) : 0;

  const entriesCharged = subentryCount + numSponsoring - numSponsored;
  const minimumBalanceRaw = (2 + entriesCharged) * baseReserve;

  // Use integer arithmetic via stroops to avoid floating-point rounding.
  const minimumBalanceStr = toFixedDecimal(minimumBalanceRaw);

  const nativeBalanceEntry = account.balances.find((b) => b.asset_type === "native");
  const nativeBalanceRaw = nativeBalanceEntry ? Number(nativeBalanceEntry.balance) : 0;
  const nativeBalanceStr = toFixedDecimal(nativeBalanceRaw);

  const spendableRaw = Math.max(0, nativeBalanceRaw - minimumBalanceRaw);
  const potentiallySpendableStr = toFixedDecimal(spendableRaw);

  const formula = `(2 + ${subentryCount} + ${numSponsoring} - ${numSponsored}) × ${baseReserve} = ${minimumBalanceStr} XLM`;

  return {
    baseReserve,
    subentryCount,
    numSponsoring,
    numSponsored,
    lastModifiedLedger,
    formula,
    minimumBalance: minimumBalanceStr,
    nativeBalance: nativeBalanceStr,
    potentiallySpendable: potentiallySpendableStr
  };
}

/** Format a number as a fixed-point decimal string using integer stroop arithmetic. */
function toFixedDecimal(n: number): string {
  // Convert to stroops (×10⁷), round, then convert back.
  const stroops = Math.round(n * 10_000_000);
  const whole = Math.floor(stroops / 10_000_000);
  const frac = stroops % 10_000_000;
  const fracStr = String(Math.abs(frac)).padStart(7, "0").replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr}` : String(whole);
}
