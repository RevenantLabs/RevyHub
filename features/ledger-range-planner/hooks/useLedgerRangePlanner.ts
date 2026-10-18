"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {parseInput} from "../schema";
import {analyze} from "../lib/ledgerRangePlanner";
import {unexpectedFailure} from "../lib/ledgerRangePlanner.errors";
import type {RawInput,Report,ErrorCode} from "../types";
export type State = {status:"idle"}|{status:"loading"}|{status:"success";result:Report}|{status:"error";code:ErrorCode;detail?:unknown};
export function useLedgerRangePlanner() {
 const [state,setState]=useState<State>({status:"idle"});const generation=useRef(0);
 useEffect(()=>()=>{generation.current++;},[]);
 const reset=useCallback(()=>{generation.current++;setState({status:"idle"});},[]);
 const submit=useCallback(async(raw:RawInput)=>{
  const id=++generation.current; const parsed=parseInput(raw);
  if(!parsed.ok){setState({status:"error",code:parsed.code});return;}
  setState({status:"loading"});
  try{const result=await analyze(parsed.value);if(id!==generation.current)return;setState(result.ok?{status:"success",result:result.value}:{status:"error",code:result.code,detail:result.detail});}
  catch{if(id===generation.current)setState({status:"error",code:unexpectedFailure()});}
 },[]);
 return {state,submit,reset};
}
