import { StrKey, encodeMuxedAccountToAddress, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { AccountMergeValueReconcilerErrorCode as Code, EnvelopeKind, MergeTransfer } from "../types";

export interface EnvelopeOperations {
  kind: EnvelopeKind;
  /** Inner transaction source as written (G… or M…). */
  source: string;
  /** Account that pays the fee: the outer fee source for a fee bump. */
  feePayer: string;
  /** Maximum fee the envelope allows, exact stroops. `feeCharged` can never exceed it. */
  maxFeeStroops: string;
  operations: xdr.Operation[];
}

interface MuxedIdentity { address: string; account: string }

function muxed(account: xdr.MuxedAccount): MuxedIdentity {
  const address = encodeMuxedAccountToAddress(account, true);
  const ed25519 = account.switch().name === "keyTypeMuxedEd25519" ? account.med25519().ed25519() : account.ed25519();
  return { address, account: StrKey.encodeEd25519PublicKey(ed25519) };
}

export function readEnvelope(envelope: xdr.TransactionEnvelope): Result<EnvelopeOperations, Code> {
  try {
    switch (envelope.switch().name) {
      case "envelopeTypeTxV0": {
        const tx = envelope.v0().tx();
        const source = StrKey.encodeEd25519PublicKey(tx.sourceAccountEd25519());
        return ok({ kind: "classic-v0", source, feePayer: source, maxFeeStroops: String(tx.fee()), operations: tx.operations() });
      }
      case "envelopeTypeTx": {
        const tx = envelope.v1().tx();
        const source = muxed(tx.sourceAccount()).address;
        return ok({ kind: "classic-v1", source, feePayer: source, maxFeeStroops: String(tx.fee()), operations: tx.operations() });
      }
      case "envelopeTypeTxFeeBump": {
        const tx = envelope.feeBump().tx();
        if (tx.innerTx().switch().name !== "envelopeTypeTx") return err("unsupported_variant");
        const inner = tx.innerTx().v1().tx();
        return ok({
          kind: "fee-bump",
          source: muxed(inner.sourceAccount()).address,
          feePayer: muxed(tx.feeSource()).address,
          maxFeeStroops: tx.fee().toString(),
          operations: inner.operations()
        });
      }
      default: return err("unsupported_variant");
    }
  } catch { return err("malformed_data"); }
}

/** Underlying G… account for a G… or M… address. */
export function baseAccount(address: string): string {
  if (!StrKey.isValidMed25519PublicKey(address)) return address;
  return StrKey.encodeEd25519PublicKey(StrKey.decodeMed25519PublicKey(address).subarray(0, 32));
}

export interface MappedResults {
  transfers: MergeTransfer[];
  transactionFailed: boolean;
  /** Inner (or only) transaction result code, for example `txSuccess`. */
  transactionCode: string;
}

/**
 * Pairs each account-merge operation with the operation result at the same
 * index. The transferred amount is read only from `sourceAccountBalance` of a
 * successful merge result in a successful transaction.
 */
export function mapMergeResults(envelope: EnvelopeOperations, result: xdr.TransactionResult): Result<MappedResults, Code> {
  try {
    const feeCharged = BigInt(result.feeCharged().toString());
    if (feeCharged < 0n) return err("malformed_data");
    if (feeCharged > BigInt(envelope.maxFeeStroops)) return err("incompatible_transaction");
    const outer = result.result();
    const outerCode = outer.switch().name;
    const bump = envelope.kind === "fee-bump";
    if (bump !== (outerCode === "txFeeBumpInnerSuccess" || outerCode === "txFeeBumpInnerFailed")) return err("incompatible_transaction");
    const inner = bump ? outer.innerResultPair().result().result() : outer;
    const code = inner.switch().name;
    const transactionFailed = code !== "txSuccess";
    const hasResults = code === "txSuccess" || code === "txFailed";
    const results = hasResults ? inner.results() : [];
    if (hasResults && results.length !== envelope.operations.length) return err("incompatible_transaction");
    if (code === "txSuccess" && results.some((item) => item.switch().name !== "opInner")) return err("incompatible_transaction");
    for (let index = 0; index < results.length; index++) {
      if (results[index].switch().name === "opInner" &&
          results[index].tr().switch().name !== envelope.operations[index].body().switch().name) {
        return err("incompatible_transaction");
      }
    }
    const transfers: MergeTransfer[] = [];
    envelope.operations.forEach((operation, index) => {
      if (operation.body().switch().name !== "accountMerge") return;
      const override = operation.sourceAccount() ?? null;
      const source = override ? muxed(override) : { address: envelope.source, account: baseAccount(envelope.source) };
      const destination = muxed(operation.body().destination());
      const opResult = results[index];
      let status: MergeTransfer["status"] = "unavailable";
      let resultCode: string = code;
      let stroops: string | null = null;
      if (opResult) {
        resultCode = opResult.switch().name;
        status = "failed";
        if (resultCode === "opInner") {
          const merge = opResult.tr().accountMergeResult();
          resultCode = merge.switch().name;
          if (resultCode === "accountMergeSuccess") {
            if (transactionFailed) status = "rolled_back";
            else {
              const amount = BigInt(merge.sourceAccountBalance().toString());
              if (amount < 0n) throw new RangeError("negative merge transfer");
              stroops = amount.toString();
              status = "success";
            }
          }
        }
      }
      transfers.push({
        index,
        source: source.address,
        sourceAccount: source.account,
        destination: destination.address,
        destinationAccount: destination.account,
        sourceOverride: override !== null,
        status,
        code: resultCode,
        stroops
      });
    });
    return ok({ transfers, transactionFailed, transactionCode: code });
  } catch { return err("malformed_data"); }
}
