import { Keypair, StrKey } from "@stellar/stellar-sdk";
export const baseAccount = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 31)).publicKey();
export const senderAccount = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 32)).publicKey();
export const issuerAccount = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 33)).publicKey();
export const missingAccount = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 34)).publicKey();
export function muxedAddress(id: bigint): string {
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64BE(id);
  return StrKey.encodeMed25519PublicKey(Buffer.concat([StrKey.decodeEd25519PublicKey(baseAccount), bytes]));
}
export const common = { created_at: "2026-09-28T08:00:00Z", transaction_hash: "a".repeat(64), from: senderAccount, asset_type: "native" };
