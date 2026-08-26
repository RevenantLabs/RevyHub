import { ok, err, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toSequenceInspectorErrorCode } from "@/features/sequence-inspector/lib/sequenceInspector.errors";
import type {
  SequenceInspectorErrorCode,
  SequenceInspectorInput,
  SequenceInspectorResult
} from "@/features/sequence-inspector/types";

export async function inspectSequence(
  { accountId, bumpTarget }: SequenceInspectorInput,
  network: StellarNetwork
): Promise<Result<SequenceInspectorResult, SequenceInspectorErrorCode>> {
  try {
    const account = await horizonServer(network).loadAccount(accountId);
    const sequence = account.sequence;
    
    const seqBigInt = BigInt(sequence);
    
    // High 32 bits is ledger, low 32 bits is offset
    const ledger = (seqBigInt >> 32n).toString();
    const offset = (seqBigInt & 0xffffffffn).toString();
    
    const nextSequence = (seqBigInt + 1n).toString();
    
    if (bumpTarget) {
      const bumpBigInt = BigInt(bumpTarget);
      if (bumpBigInt <= seqBigInt) {
        return err("invalid_bump_target");
      }
    }

    return ok({
      accountId,
      sequence,
      ledger,
      offset,
      nextSequence,
      ...(bumpTarget ? { bumpTarget } : {})
    });
  } catch (error) {
    return err(toSequenceInspectorErrorCode(error));
  }
}
