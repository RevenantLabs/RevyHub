import {err,ok,type Result} from "@/core/result/result";
import type {RawInput,ErrorCode,Input} from "./types";
import {StrKey} from "@stellar/stellar-sdk";
export function parseInput(raw:RawInput):Result<Input,ErrorCode>{
 if(raw.mode==="Decode"){
 const muxed=(raw.muxed??"").trim();if(!muxed)return err("empty_input");
 if(/^S/i.test(muxed)||muxed.length!==69||!StrKey.isValidMed25519PublicKey(muxed))return err("invalid_muxed_address");
 return ok({mode:"Decode",muxed});
 }
 if(raw.mode!=="Encode")return err("empty_input");
 const base=(raw.base??"").trim();const id=(raw.id??"").trim();if(!base)return err("empty_input");
 if(/^S/i.test(base)||!StrKey.isValidEd25519PublicKey(base))return err("invalid_base_address");
 if(!/^[0-9]{1,20}$/.test(id)||BigInt(id)>18446744073709551615n)return err("invalid_id");
 return ok({mode:"Encode",base,id:BigInt(id).toString()});
 }
