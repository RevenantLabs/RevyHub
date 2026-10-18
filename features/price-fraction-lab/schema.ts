import {err,ok,type Result} from "@/core/result/result";
import type {RawInput,ErrorCode,Input} from "./types";
export function parseInput(raw:RawInput):Result<Input,ErrorCode>{
 if(Object.values(raw).some(value=>value.length>100))return err("input_too_large");
 const precision=raw.precision??"7";if(!/^\d{1,2}$/.test(precision)||Number(precision)>18)return err("invalid_input");
 let n:bigint,d:bigint;
 if(raw.mode==="Decimal"){
 const value=(raw.decimal??"").trim();if(!value)return err("empty_input");if(!/^\d+(\.\d+)?$/.test(value))return err("invalid_input");
 const [whole,fraction=""]=value.split(".");n=BigInt(whole+fraction);d=10n**BigInt(fraction.length);
 }else if(raw.mode==="Fraction"){
 const numerator=(raw.numerator??"").trim(),denominator=(raw.denominator??"").trim();if(!numerator||!denominator)return err("empty_input");
 if(!/^\d+$/.test(numerator)||!/^\d+$/.test(denominator))return err("invalid_input");n=BigInt(numerator);d=BigInt(denominator);if(d===0n)return err("zero_denominator");
 }else return err("empty_input");
 if(n===0n)return err("invalid_input");return ok({n,d,precision:Number(precision)});
}
