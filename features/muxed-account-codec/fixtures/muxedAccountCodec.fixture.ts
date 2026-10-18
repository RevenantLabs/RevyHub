import {Keypair,encodeMuxedAccount,encodeMuxedAccountToAddress} from "@stellar/stellar-sdk";
import {Buffer} from "buffer";
export const base=Keypair.fromRawEd25519Seed(Buffer.alloc(32,7)).publicKey();
export const muxed=encodeMuxedAccountToAddress(encodeMuxedAccount(base,"18446744073709551615"),true);
export const sample = {mode:"Decode",muxed,base:"",id:""};
