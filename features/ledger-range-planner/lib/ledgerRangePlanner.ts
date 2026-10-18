import {err,ok,type Result} from "@/core/result/result";
import type {Input,Report,ErrorCode} from "../types";
import {copy} from "../copy";
export function analyze(input:Input):Result<Report,ErrorCode>{
 const intersection=(a:bigint,b:bigint,c:bigint,d:bigint)=>{const start=a>c?a:c,end=b<d?b:d;return start<=end?{start,end}:null;};
 const retained=input.oldest===null?null:intersection(input.start,input.end,input.oldest,input.latest!);
 const older=input.oldest===null||input.oldest===1n?null:intersection(input.start,input.end,1n,input.oldest-1n);
 const future=input.latest===null||input.latest===4294967295n?null:intersection(input.start,input.end,input.latest+1n,4294967295n);
 const selected=input.scope==="Retained intersection"?retained:{start:input.start,end:input.end};
 const total=selected?(selected.end-selected.start+input.chunk)/input.chunk:0n;
 if(total>1000n)return err("too_many_chunks",{totalChunks:total.toString(),maxChunks:"1000"});
 const span=(v:{start:bigint;end:bigint}|null)=>v?`${v.start}–${v.end}`:copy.noIntersection;
 const rows:NonNullable<Report["rows"]>=[];
 if(selected)for(let start=selected.start;start<=selected.end;start+=input.chunk){const end=start+input.chunk-1n<selected.end?start+input.chunk-1n:selected.end;
 const parts:Record<string,string>={};if(input.oldest!==null){parts.retained=span(intersection(start,end,input.oldest,input.latest!));parts.older=input.oldest>1n?span(intersection(start,end,1n,input.oldest-1n)):copy.noIntersection;parts.future=input.latest!<4294967295n?span(intersection(start,end,input.latest!+1n,4294967295n)):copy.noIntersection;}
 const classification=input.oldest===null?copy.unknownRetention:end<input.oldest?copy.olderClass:start>input.latest!?copy.futureClass:start>=input.oldest&&end<=input.latest!?copy.retainedClass:copy.mixedClass;
 rows.push({id:start.toString(),kind:classification,values:{start:start.toString(),end:end.toString(),count:(end-start+1n).toString(),classification,...parts}});
 }
 return ok({values:{requested:span({start:input.start,end:input.end}),selected:span(selected),assumption:input.oldest===null?copy.unknownRetention:span({start:input.oldest,end:input.latest!}),chunks:total.toString(),retained:input.oldest===null?copy.unknownRetention:span(retained),older:input.oldest===null?copy.unknownRetention:span(older),future:input.latest===null?copy.unknownRetention:span(future)},rows,export:{scope:input.scope,requested:{start:input.start.toString(),end:input.end.toString()},retention:input.oldest===null?null:{oldest:input.oldest.toString(),latest:input.latest!.toString()},totalChunks:total.toString(),chunks:rows.map(row=>row.values)}});
}
