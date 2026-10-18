import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { INT64_MAX } from "@/features/sequence-inspector/schema";
import { toSequenceInspectorErrorCode } from "@/features/sequence-inspector/lib/sequenceInspector.errors";
import type {
  HorizonSequenceAccount,
  SequenceInspectorErrorCode,
  SequenceInspectorInput,
  SequenceInspectorResult
} from "@/features/sequence-inspector/types";

const LOW_32_BITS = 0xffff_ffffn;
const DECIMAL_INTEGER = /^[0-9]+$/;
const REQUEST_TIMEOUT_MS = 12_000;

export class HorizonResponseError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Horizon returned HTTP ${status}`);
    this.name = "HorizonResponseError";
    this.status = status;
  }
}

export function deriveSequenceResult(
  account: HorizonSequenceAccount,
  bumpTarget?: string
): Result<SequenceInspectorResult, SequenceInspectorErrorCode> {
  try {
    const sequenceLedger = String(account.sequence_ledger);
    if (
      typeof account.account_id !== "string" ||
      account.sequence.length > INT64_MAX.toString().length ||
      !DECIMAL_INTEGER.test(account.sequence) ||
      !DECIMAL_INTEGER.test(sequenceLedger) ||
      (bumpTarget !== undefined &&
        (bumpTarget.length > INT64_MAX.toString().length || !DECIMAL_INTEGER.test(bumpTarget)))
    ) {
      return err("request_failed");
    }

    const currentSequence = BigInt(account.sequence);
    const sequenceUpdatedLedger = BigInt(sequenceLedger);
    const creationLedger = currentSequence >> 32n;
    const offset = currentSequence & LOW_32_BITS;
    const nextSequence = currentSequence === INT64_MAX ? null : currentSequence + 1n;
    const target = bumpTarget === undefined ? undefined : BigInt(bumpTarget);

    if (
      currentSequence > INT64_MAX ||
      sequenceUpdatedLedger > LOW_32_BITS
    ) {
      return err("request_failed");
    }
    if (target !== undefined && (target <= currentSequence || target > INT64_MAX)) {
      return err("invalid_bump_target");
    }

    return ok({
      accountId: account.account_id,
      currentSequence,
      nextSequence,
      creationLedger,
      offset,
      creationLedgerMaximum: (creationLedger << 32n) | LOW_32_BITS,
      sequenceUpdatedLedger,
      ...(target === undefined
        ? {}
        : {
            bumpTarget: target,
            bumpIncrease: target - currentSequence,
            bumpChangesLedgerPrefix: (target >> 32n) !== creationLedger
          })
    });
  } catch {
    return err("request_failed");
  }
}

export async function inspectSequence(
  input: SequenceInspectorInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<SequenceInspectorResult, SequenceInspectorErrorCode>> {
  const requestController = new AbortController();
  const abortFromCaller = () => requestController.abort();
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = setTimeout(() => requestController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      horizonUrl(network, `/accounts/${encodeURIComponent(input.accountId)}`),
      { signal: requestController.signal, headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new HorizonResponseError(response.status);
    const account = (await response.json()) as HorizonSequenceAccount;
    if (account.account_id !== input.accountId) return err("request_failed");
    return deriveSequenceResult(account, input.bumpTarget);
  } catch (error) {
    return err(toSequenceInspectorErrorCode(error));
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
