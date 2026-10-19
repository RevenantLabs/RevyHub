import { Keypair, xdr } from "@stellar/stellar-sdk";

const emptyExt = () => new (xdr.TransactionResultExt as unknown as new (v: 0) => xdr.TransactionResultExt)(0);
export const sourceAccount = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 21)).publicKey();
export const successHash = "a".repeat(64);
export const missingHash = "d".repeat(64);
export const malformedHash = "e".repeat(64);
export const unsupportedHash = "f".repeat(64);
export const rateLimitedHash = "1".repeat(64);
export const requestFailedHash = "2".repeat(64);
export const successOperation = xdr.OperationResult.opInner(xdr.OperationResultTr.bumpSequence(xdr.BumpSequenceResult.bumpSequenceSuccess()));
export const successXdr = new xdr.TransactionResult({ feeCharged: xdr.Int64.fromString("100"), result: xdr.TransactionResultResult.txSuccess([successOperation]), ext: emptyExt() }).toXDR("base64");
export const successRecord = { hash: successHash, successful: true, result_xdr: successXdr, operation_count: 1 };
export const successOperations = { _embedded: { records: [{ id: "1", type: "bump_sequence", source_account: sourceAccount }] } };
