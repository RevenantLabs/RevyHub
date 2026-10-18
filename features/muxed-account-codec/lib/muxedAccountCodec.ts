import {err,ok,type Result} from "@/core/result/result";
import type {Input,Report,ErrorCode} from "../types";
import {StrKey,encodeMuxedAccount,encodeMuxedAccountToAddress,decodeAddressToMuxedAccount} from "@stellar/stellar-sdk";
import {copy} from "../copy";
export function analyze(input:Input):Result<Report,ErrorCode>{
 try{
  const muxed=input.mode==="Decode"?input.muxed:encodeMuxedAccountToAddress(encodeMuxedAccount(input.base,input.id),true);
  const parts=decodeAddressToMuxedAccount(muxed,true).med25519();
  return ok({values:{muxed,base:StrKey.encodeEd25519PublicKey(parts.ed25519()),id:parts.id().toString(),note:copy.description}});
 }catch{return err(input.mode==="Decode"?"invalid_muxed_address":"invalid_base_address");}
 }
