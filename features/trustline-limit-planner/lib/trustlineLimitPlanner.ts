import {err,ok,type Result} from "@/core/result/result";
import type {Input,Report,ErrorCode} from "../types";
import {copy} from "../copy";
export function amountString(n:bigint):string{const sign=n<0n?"-":"";const value=n<0n?-n:n;return sign+(value/10000000n).toString()+"."+(value%10000000n).toString().padStart(7,"0");}
export function analyze(input:Input):Result<Report,ErrorCode>{
 const minimum=input.balance+input.buying;const deletion=input.proposed===0n;const blockers:string[]=[];
 if(deletion){if(input.balance!==0n)blockers.push(copy.balanceBlock);if(input.buying!==0n)blockers.push(copy.buyingBlock);if(input.selling!==0n)blockers.push(copy.sellingBlock);}
 else if(input.proposed<minimum)blockers.push(copy.limitBlock);
 const warnings:string[]=[];if(input.authorized===false)warnings.push(copy.authorizationWarning);if(input.authorized===undefined)warnings.push(copy.authorizationUnknown);
 const flag=(v:boolean|undefined)=>v===undefined?copy.unknown:v?copy.yes:copy.no;
 return ok({values:{asset:`${input.code}:${input.issuer}`,balance:amountString(input.balance),currentLimit:amountString(input.limit),proposedLimit:amountString(input.proposed),buying:amountString(input.buying),selling:amountString(input.selling),minimum:amountString(minimum),currentHeadroom:amountString(input.limit-minimum),proposedHeadroom:amountString(input.proposed-minimum),status:blockers.length?copy.blocked:deletion?copy.deletionCandidate:copy.limitCandidate,constraints:[...blockers,...warnings].join(" ")||copy.noBlockers,authorized:flag(input.authorized),maintain:flag(input.maintain),clawback:flag(input.clawback),caveat:copy.description}});
}
