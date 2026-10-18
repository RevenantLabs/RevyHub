import {err,ok,type Result} from "@/core/result/result";
import type {Input,Report,ErrorCode} from "../types";
import {TransactionBuilder} from "@stellar/stellar-sdk";import {Buffer} from "buffer";
export async function analyze(input:Input):Promise<Result<Report,ErrorCode>>{
 if(input.mode==="Transaction"){
 try{const tx=TransactionBuilder.fromXDR(input.value,input.passphrase);const digest=tx.hash();return ok({values:{mode:input.mode,hex:digest.toString("hex"),base64:digest.toString("base64"),passphrase:input.passphrase}});}catch{return err("invalid_xdr");}
 }
 if(!globalThis.crypto?.subtle?.digest)return err("crypto_unavailable");
 try{const digest=Buffer.from(await crypto.subtle.digest("SHA-256",Uint8Array.from(input.bytes)));return ok({values:{mode:input.mode,hex:digest.toString("hex"),base64:digest.toString("base64"),bytes:String(input.bytes.length)}});}catch{return err("crypto_unavailable");}
}
