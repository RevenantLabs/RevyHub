import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const newAccountId = seed(1).publicKey();
export const fundedAccountId = seed(2).publicKey();
export const rateLimitedAccountId = seed(3).publicKey();
export const secretSeed = seed(4).secret();

export const friendbotSuccess = {
  hash: "d".repeat(64),
  ledger: 1017700,
  successful: true
};

/** Friendbot's real 400 body when the account already exists. */
export const alreadyFundedBody =
  '{"status":400,"detail":"op_already_exists","extras":{"result_codes":{"operations":["op_already_exists"],"transaction":"tx_failed"}}}';
