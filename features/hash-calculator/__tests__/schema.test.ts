import {expect,it} from "vitest";
import {parseInput} from "../schema";
import {sample} from "../fixtures/hashCalculator.fixture";
import {envelope} from "../fixtures/hashCalculator.fixture";
it("rejects malformed encodings, empty values and oversized input",()=>{expect(parseInput({})).toEqual({ok:false,code:"empty_input"});for(const [encoding,value] of [["Hex","a"],["Hex","gg"],["Base64","YR=="],["Base64","YWJj!"]])expect(parseInput({...sample,encoding,value})).toEqual({ok:false,code:"invalid_encoding"});expect(parseInput({...sample,value:"a".repeat(262145)})).toEqual({ok:false,code:"invalid_encoding"});});
it("requires a passphrase and rejects malformed or trailing XDR",()=>{expect(parseInput({...sample,mode:"Transaction",network:"Custom",value:envelope})).toEqual({ok:false,code:"empty_passphrase"});expect(parseInput({...sample,mode:"Transaction",value:"YWJj"})).toEqual({ok:false,code:"invalid_xdr"});expect(parseInput({...sample,mode:"Transaction",value:envelope+"AAAA"})).toEqual({ok:false,code:"invalid_xdr"});expect(parseInput({...sample,mode:"Transaction",value:" "+envelope+"\n"}).ok).toBe(true);});

import {webcrypto} from "node:crypto";
import {beforeEach,afterEach,vi} from "vitest";
beforeEach(()=>vi.stubGlobal("crypto",webcrypto));afterEach(()=>vi.unstubAllGlobals());
