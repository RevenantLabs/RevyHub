import {err,ok,type Result} from "@/core/result/result";
import type {RawInput,ErrorCode,Input} from "./types";
export function parseInput(raw:RawInput):Result<Input,ErrorCode>{
 const value=(raw.value??"").trim();if(!value)return err("empty_input");
 if(/^S/i.test(value))return err("secret_seed_rejected");
 if(!/^[GMCTXP]/.test(value))return err("unknown_prefix");
 if(value.length>1024||!/^[A-Z2-7]+$/.test(value))return err("bad_checksum");
 return ok({value});
 }
