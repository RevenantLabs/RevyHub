import {
  Account,
  Address,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  nativeToScVal
} from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

const sourceKeypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 1));
export const sourceAccountId = sourceKeypair.publicKey();

export const wasmHash = Buffer.alloc(32, 7);
export const salt = Buffer.alloc(32, 9);

function buildEnvelope(operation: ReturnType<typeof Operation.createCustomContract>): string {
  const account = new Account(sourceAccountId, "100");
  const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
    .addOperation(operation)
    .setTimeout(30)
    .build();
  return tx.toXDR();
}

/**
 * CreateContractV2: an address-derived preimage, a Wasm executable, and two
 * constructor arguments — the "normal case" most tests exercise.
 */
export const envelope = buildEnvelope(
  Operation.createCustomContract({
    address: new Address(sourceAccountId),
    wasmHash,
    salt,
    constructorArgs: [nativeToScVal("hello", { type: "symbol" }), nativeToScVal(42, { type: "u32" })]
  })
);

export const sample = { envelope };
