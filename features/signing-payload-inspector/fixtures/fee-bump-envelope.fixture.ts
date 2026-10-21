import { Keypair, Networks, Transaction, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { classicXdr } from "@/features/signing-payload-inspector/fixtures/classic-envelope.fixture";

export const feeSource = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 43)).publicKey();
const inner = TransactionBuilder.fromXDR(classicXdr, Networks.TESTNET) as Transaction;
/** A synthetic decorated signature tests byte inclusion without signing or private-key use. */
inner.signatures.push(new xdr.DecoratedSignature({
  hint: Buffer.from([1, 2, 3, 4]),
  signature: Buffer.alloc(64, 7)
}));
export const feeBumpXdr = TransactionBuilder.buildFeeBumpTransaction(
  feeSource,
  "200",
  inner,
  Networks.TESTNET
).toXDR();
