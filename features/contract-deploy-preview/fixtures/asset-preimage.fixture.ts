import { Account, Asset, Keypair, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

const sourceKeypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 3));
const sourceAccountId = sourceKeypair.publicKey();
const issuerKeypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 4));

export const asset = new Asset("USDX", issuerKeypair.publicKey());

/**
 * CreateContract for a Stellar Asset Contract: an asset-derived preimage
 * with the built-in `stellar_asset` executable, not a Wasm hash.
 */
export const envelope = (() => {
  const account = new Account(sourceAccountId, "300");
  const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.createStellarAssetContract({ asset }))
    .setTimeout(30)
    .build();
  return tx.toXDR();
})();
