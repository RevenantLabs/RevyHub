import {err,ok,type Result} from "@/core/result/result";
import type {Input,Report,ErrorCode} from "../types";
import {StrKey,decodeAddressToMuxedAccount} from "@stellar/stellar-sdk";
import {Buffer} from "buffer";
import {kindCopy} from "../copy";
export function analyze(input:Input):Result<Report,ErrorCode>{
 const decoders:Record<string,{decode:(value:string)=>Buffer;kind:string;version:number}>={
 G:{decode:StrKey.decodeEd25519PublicKey,kind:kindCopy.G,version:48},
 M:{decode:StrKey.decodeMed25519PublicKey,kind:kindCopy.M,version:96},
 C:{decode:StrKey.decodeContract,kind:kindCopy.C,version:16},
 T:{decode:StrKey.decodePreAuthTx,kind:kindCopy.T,version:152},
 X:{decode:StrKey.decodeSha256Hash,kind:kindCopy.X,version:184},
 P:{decode:StrKey.decodeSignedPayload,kind:kindCopy.P,version:120}
 };
 if(/^S/i.test(input.value))return err("secret_seed_rejected");
 const decoder=decoders[input.value[0]];if(!decoder)return err("unknown_prefix");
 try{
 const raw=decoder.decode(input.value);const values:Report["values"]={kind:decoder.kind,version:String(decoder.version),hex:raw.toString("hex"),bytes:String(raw.length)};
 if(input.value.startsWith("M")){const muxed=decodeAddressToMuxedAccount(input.value,true).med25519();values.base=StrKey.encodeEd25519PublicKey(muxed.ed25519());values.id=muxed.id().toString();}
 return ok({values});
 }catch{return err("bad_checksum");}
 }
