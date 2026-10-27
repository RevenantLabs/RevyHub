import { Account, Asset, Keypair, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
export const transactionSourceKey = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 53));
export const overrideSourceKey = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 54));
const destination = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 55));
export const sourceOverrideXdr = new TransactionBuilder(new Account(transactionSourceKey.publicKey(), "100"), { fee: "100", networkPassphrase: Networks.TESTNET, timebounds: { minTime: 0, maxTime: 0 } })
  .addOperation(Operation.payment({ source: overrideSourceKey.publicKey(), destination: destination.publicKey(), asset: Asset.native(), amount: "1" }))
  .build().toXDR();
