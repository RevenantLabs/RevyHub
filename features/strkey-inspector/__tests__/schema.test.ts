import {expect,it} from "vitest";
import {parseInput} from "../schema";
import {sample} from "../fixtures/strkeyInspector.fixture";
it("rejects seeds by prefix before decoding or retaining input",()=>{for(const value of ["S"," S-not-valid ","sanything"]){expect(parseInput({value})).toEqual({ok:false,code:"secret_seed_rejected"});}});
it("validates empty, unknown, malformed and bounded values",()=>{expect(parseInput({})).toEqual({ok:false,code:"empty_input"});expect(parseInput({value:"B123"})).toEqual({ok:false,code:"unknown_prefix"});expect(parseInput({value:"G".repeat(1025)})).toEqual({ok:false,code:"bad_checksum"});expect(parseInput({value:"G0!"})).toEqual({ok:false,code:"bad_checksum"});expect(parseInput({value:" "+sample.value+" "})).toEqual({ok:true,value:{value:sample.value}});});
