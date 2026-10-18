import {Keypair} from "@stellar/stellar-sdk";import {Buffer} from "buffer";
export const issuer=Keypair.fromRawEd25519Seed(Buffer.alloc(32,8)).publicKey();
export const otherIssuer=Keypair.fromRawEd25519Seed(Buffer.alloc(32,9)).publicKey();
export const row={asset_type:"credit_alphanum4",asset_code:"USD",asset_issuer:issuer,balance:"7.0000000",limit:"20.0000000",buying_liabilities:"3.0000000",selling_liabilities:"0.0000000",is_authorized:true};
export const sample = {snapshot:JSON.stringify(row),limit:"10.0000001"};
