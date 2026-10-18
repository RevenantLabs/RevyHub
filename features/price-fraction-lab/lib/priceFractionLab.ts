import {err,ok,type Result} from "@/core/result/result";
import type {Input,Report,ErrorCode} from "../types";
export function gcd(a:bigint,b:bigint):bigint{while(b){[a,b]=[b,a%b];}return a;}
export function preview(n:bigint,d:bigint,precision:number):string{const scale=10n**BigInt(precision);const digits=(n*scale/d).toString().padStart(precision+1,"0");return precision?digits.slice(0,-precision)+"."+digits.slice(-precision):digits;}
export function analyze(input:Input):Result<Report,ErrorCode>{
 const divisor=gcd(input.n,input.d);const n=input.n/divisor;const d=input.d/divisor;
 if(n>2147483647n||d>2147483647n)return err("out_of_range");
 return ok({values:{numerator:n.toString(),denominator:d.toString(),decimal:preview(n,d,input.precision),inverseNumerator:d.toString(),inverseDenominator:n.toString(),inverseDecimal:preview(d,n,input.precision),error:"0/1"}});
}
