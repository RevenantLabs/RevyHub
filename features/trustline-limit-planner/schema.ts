import {err,ok,type Result} from "@/core/result/result";
import type {RawInput,ErrorCode,Input} from "./types";
import {Asset,StrKey} from "@stellar/stellar-sdk";
export function parseAmount(value:unknown):bigint|null{if(typeof value!=="string"||value.length>30||!/^\d+(\.\d{1,7})?$/.test(value))return null;const [whole,fraction=""]=value.split(".");const n=BigInt(whole)*10000000n+BigInt(fraction.padEnd(7,"0"));return n<=9223372036854775807n?n:null;}
export function parseInput(raw:RawInput):Result<Input,ErrorCode>{
 if(!raw.snapshot?.trim()||!raw.limit?.trim())return err("empty_input");if(raw.snapshot.length>65536||raw.limit.length>30)return err("input_too_large");
 const proposed=parseAmount(raw.limit.trim());if(proposed===null)return err("invalid_limit");
 let value:unknown;try{value=JSON.parse(raw.snapshot);}catch{return err("invalid_input");}
 if(!value||typeof value!=="object"||Array.isArray(value))return err("invalid_input");const row=value as Record<string,unknown>;
 if(row.asset_type==="native"||row.asset_type==="liquidity_pool_shares")return err("unsupported_balance_type");
 if(row.asset_type!=="credit_alphanum4"&&row.asset_type!=="credit_alphanum12")return err("invalid_input");
 if(typeof row.asset_code!=="string"||typeof row.asset_issuer!=="string"||/^S/i.test(row.asset_issuer)||!StrKey.isValidEd25519PublicKey(row.asset_issuer))return err("invalid_input");
 try{const asset=new Asset(row.asset_code,row.asset_issuer);if(asset.getAssetType()!==row.asset_type)return err("invalid_input");}catch{return err("invalid_input");}
 for(const key of ["balance","limit","buying_liabilities","selling_liabilities"])if(row[key]===undefined||row[key]===null)return err("incomplete_snapshot");
 const balance=parseAmount(row.balance),limit=parseAmount(row.limit),buying=parseAmount(row.buying_liabilities),selling=parseAmount(row.selling_liabilities);
 if(balance===null||limit===null||buying===null||selling===null)return err("invalid_input");
 for(const key of ["is_authorized","is_authorized_to_maintain_liabilities","is_clawback_enabled"])if(row[key]!==undefined&&typeof row[key]!=="boolean")return err("invalid_input");
 return ok({code:row.asset_code,issuer:row.asset_issuer,balance,limit,buying,selling,proposed,authorized:row.is_authorized as boolean|undefined,maintain:row.is_authorized_to_maintain_liabilities as boolean|undefined,clawback:row.is_clawback_enabled as boolean|undefined});
}
