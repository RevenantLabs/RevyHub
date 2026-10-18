import {err,ok,type Result} from "@/core/result/result";
import type {RawInput,ErrorCode,Input} from "./types";
export function parseInput(raw:RawInput):Result<Input,ErrorCode>{
 if(Object.values(raw).some(v=>v.length>40))return err("input_too_large");
 const integer=(v:string|undefined):bigint|null=>{if(!v||!/^\d{1,10}$/.test(v.trim()))return null;const n=BigInt(v.trim());return n>=1n&&n<=4294967295n?n:null;};
 if(!raw.start?.trim()||!raw.end?.trim()||!raw.chunk?.trim())return err("empty_input");
 const start=integer(raw.start),end=integer(raw.end),chunk=integer(raw.chunk);if(start===null||end===null||chunk===null)return err("invalid_input");
 if(start>end)return err("reversed_range");
 const hasRetention=!!raw.oldest?.trim()||!!raw.latest?.trim();const oldest=integer(raw.oldest),latest=integer(raw.latest);
 if(hasRetention&&(oldest===null||latest===null||oldest>latest))return err("invalid_retention");
 const scope=raw.scope??"Requested range";if(scope!=="Requested range"&&scope!=="Retained intersection")return err("invalid_input");
 if(scope==="Retained intersection"&&!hasRetention)return err("invalid_retention");
 return ok({start,end,chunk,oldest,latest,scope});
}
