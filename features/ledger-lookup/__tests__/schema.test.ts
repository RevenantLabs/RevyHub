import { expect, it } from "vitest";
import { parseLedgerLookupInput } from "../schema";
it.each(["", "  "])("requires input %s", raw => expect(parseLedgerLookupInput(raw)).toEqual({ok:false,code:"empty_input"}));
it.each(["0", "-1", "1.5", "1e3", "4294967296", "9".repeat(100), "+1"])("rejects %s", raw => expect(parseLedgerLookupInput(raw)).toEqual({ok:false,code:"invalid_sequence"}));
it.each(["1", "4294967295", " 900 "])("accepts uint32 %s", raw => expect(parseLedgerLookupInput(raw)).toEqual({ok:true,value:{sequence:Number(raw)}}));
