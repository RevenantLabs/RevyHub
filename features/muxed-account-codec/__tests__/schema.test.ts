import {expect,it} from "vitest";
import {parseInput} from "../schema";
import {sample} from "../fixtures/muxedAccountCodec.fixture";
import {base} from "../fixtures/muxedAccountCodec.fixture";
it.each(["-1","1.2","1e3","18446744073709551616",""])("rejects invalid ID %s",id=>expect(parseInput({mode:"Encode",base,id})).toEqual({ok:false,code:"invalid_id"}));
it("rejects seeds and malformed checksums before retaining addresses",()=>{expect(parseInput({mode:"Encode",base:"Sanything",id:"1"})).toEqual({ok:false,code:"invalid_base_address"});expect(parseInput({mode:"Decode",muxed:"Sanything"})).toEqual({ok:false,code:"invalid_muxed_address"});expect(parseInput({mode:"Decode",muxed:base})).toEqual({ok:false,code:"invalid_muxed_address"});expect(parseInput({mode:"Decode"})).toEqual({ok:false,code:"empty_input"});expect(parseInput(sample).ok).toBe(true);});
it("normalizes exact unsigned input without floating point",()=>expect(parseInput({mode:"Encode",base,id:"0001"})).toEqual({ok:true,value:{mode:"Encode",base,id:"1"}}));
