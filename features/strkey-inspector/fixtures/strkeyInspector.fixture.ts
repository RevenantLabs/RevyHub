import {Keypair,StrKey,encodeMuxedAccount,encodeMuxedAccountToAddress} from "@stellar/stellar-sdk";
import {Buffer} from "buffer";
export const accountId=Keypair.fromRawEd25519Seed(Buffer.alloc(32,1)).publicKey();
export const muxed=encodeMuxedAccountToAddress(encodeMuxedAccount(accountId,"18446744073709551615"),true);
export const publicKinds=[accountId,muxed,StrKey.encodeContract(Buffer.alloc(32,2)),StrKey.encodePreAuthTx(Buffer.alloc(32,3)),StrKey.encodeSha256Hash(Buffer.alloc(32,4)),StrKey.encodeSignedPayload(Buffer.concat([Buffer.alloc(32,5),Buffer.from([0,0,0,1,42,0,0,0])]))];
export const sample = {value: accountId};
