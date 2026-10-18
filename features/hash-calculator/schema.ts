import {err,ok,type Result} from "@/core/result/result";
import type {RawInput,ErrorCode,Input} from "./types";
import {Buffer} from "buffer";import {Networks,xdr} from "@stellar/stellar-sdk";
export function parseInput(raw:RawInput):Result<Input,ErrorCode>{
 const value=raw.value??"";if(!value)return err("empty_input");if(value.length>262144||(raw.passphrase?.length??0)>1024)return err("invalid_encoding");
 if(/^S[A-Z2-7]{55}$/.test(value.trim()))return err("invalid_encoding");
 const base64=(s:string):Buffer|null=>{const normalized=s.replace(/\s/g,"");if(!normalized||! /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized))return null;const bytes=Buffer.from(normalized,"base64");return bytes.toString("base64")===normalized?bytes:null;};
 if(raw.mode==="Transaction"){
 const passphrase=raw.network==="Testnet"?Networks.TESTNET:raw.network==="Mainnet"?Networks.PUBLIC:raw.network==="Custom"?raw.passphrase??"":"";
 if(!passphrase.trim())return err("empty_passphrase");const bytes=base64(value);if(!bytes)return err("invalid_xdr");
 try{const envelope=xdr.TransactionEnvelope.fromXDR(bytes);if(!envelope.toXDR().equals(bytes))return err("invalid_xdr");}catch{return err("invalid_xdr");}
 return ok({mode:"Transaction",value:bytes.toString("base64"),passphrase});
 }
 if(raw.mode!=="SHA-256")return err("invalid_encoding");let bytes:Buffer;
 if(raw.encoding==="UTF-8")bytes=Buffer.from(value,"utf8");
 else if(raw.encoding==="Hex"){if(!/^(?:[a-fA-F0-9]{2})+$/.test(value))return err("invalid_encoding");bytes=Buffer.from(value,"hex");}
 else if(raw.encoding==="Base64"){const decoded=base64(value);if(!decoded)return err("invalid_encoding");bytes=decoded;}
 else return err("invalid_encoding");return ok({mode:"SHA-256",bytes});
}
