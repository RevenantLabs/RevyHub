import { Account, Asset, Keypair, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
const source = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 51));
const destination = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 52));
export const mixedOperationsXdr = new TransactionBuilder(new Account(source.publicKey(), "100"), { fee: "300", networkPassphrase: Networks.TESTNET, timebounds: { minTime: 0, maxTime: 0 } })
  .addOperation(Operation.payment({ destination: destination.publicKey(), asset: Asset.native(), amount: "2.5" }))
  .addOperation(Operation.payment({ destination: destination.publicKey(), asset: new Asset("USD", destination.publicKey()), amount: "9" }))
  .addOperation(Operation.manageData({ name: "audit", value: "yes" }))
  .build().toXDR();
