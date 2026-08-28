import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { stroopsToAmount } from "@/features/reserve-calculator/lib/format";
import { toReserveCalculatorErrorCode } from "@/features/reserve-calculator/lib/reserveCalculator.errors";
import type { ReserveCalculatorErrorCode, ReserveCalculatorInput, ReserveCalculatorResult } from "@/features/reserve-calculator/types";

const STROOPS_PER_XLM = 10_000_000n;

interface ReserveInputs {
  accountId: string;
  ledgerSequence: number;
  baseReserveStroops: string;
  nativeBalance: string;
  sellingLiabilities: string;
  subentryCount: number;
  numSponsoring: number;
  numSponsored: number;
}

/** Parses a Horizon amount using fixed seven-decimal stroop arithmetic. */
export function amountToStroops(value: string): bigint {
  if (!/^\d+(?:\.\d{1,7})?$/.test(value)) throw new Error("Invalid Horizon amount");

  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(fraction.padEnd(7, "0"));
}

/** Pure reserve calculation. All arithmetic remains integer stroops. */
export function calculateReserve(inputs: ReserveInputs): ReserveCalculatorResult {
  const baseReserve = BigInt(inputs.baseReserveStroops);
  const nativeBalance = amountToStroops(inputs.nativeBalance);
  const sellingLiabilities = amountToStroops(inputs.sellingLiabilities);
  const baseAccount = 2n * baseReserve;
  const subentries = BigInt(inputs.subentryCount) * baseReserve;
  const sponsoring = BigInt(inputs.numSponsoring) * baseReserve;
  const sponsored = BigInt(inputs.numSponsored) * baseReserve;
  const minimumBalance = baseAccount + subentries + sponsoring - sponsored;
  const rawSpendable = nativeBalance - minimumBalance - sellingLiabilities;

  return {
    accountId: inputs.accountId,
    ledgerSequence: inputs.ledgerSequence,
    baseReserve: stroopsToAmount(baseReserve),
    nativeBalance: stroopsToAmount(nativeBalance),
    sellingLiabilities: stroopsToAmount(sellingLiabilities),
    minimumBalance: stroopsToAmount(minimumBalance),
    spendableBalance: stroopsToAmount(rawSpendable > 0n ? rawSpendable : 0n),
    subentryCount: inputs.subentryCount,
    numSponsoring: inputs.numSponsoring,
    numSponsored: inputs.numSponsored,
    belowMinimum: nativeBalance < minimumBalance,
    breakdown: {
      baseAccount: stroopsToAmount(baseAccount),
      subentries: stroopsToAmount(subentries),
      sponsoring: stroopsToAmount(sponsoring),
      sponsored: stroopsToAmount(-sponsored)
    }
  };
}

export async function runReserveCalculator(
  { accountId }: ReserveCalculatorInput,
  network: StellarNetwork
): Promise<Result<ReserveCalculatorResult, ReserveCalculatorErrorCode>> {
  try {
    const server = horizonServer(network);
    // Preserve an account 404 as the most useful error if the ledger endpoint
    // is also temporarily unavailable.
    const account = await server.loadAccount(accountId);
    const ledgers = await server.ledgers().order("desc").limit(1).call();
    const ledger = ledgers.records[0];
    const native = account.balances.find((balance) => balance.asset_type === "native");
    // AccountResponse copies these Horizon fields at runtime, but the SDK
    // class declaration currently omits them from its public type.
    const sponsorship = account as typeof account & {
      readonly num_sponsoring: number;
      readonly num_sponsored: number;
    };

    if (!ledger || !native) return err("request_failed");

    return ok(
      calculateReserve({
        accountId: account.accountId(),
        ledgerSequence: ledger.sequence,
        baseReserveStroops: String(ledger.base_reserve_in_stroops),
        nativeBalance: native.balance,
        sellingLiabilities: native.selling_liabilities,
        subentryCount: account.subentry_count,
        numSponsoring: sponsorship.num_sponsoring,
        numSponsored: sponsorship.num_sponsored
      })
    );
  } catch (error) {
    return err(toReserveCalculatorErrorCode(error));
  }
}
