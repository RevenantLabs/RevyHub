import { expect,it } from "vitest";
import { parseNetworkComparisonInput,unsigned,integerString,record } from "../schema";
it("has a fixed comparison action",()=>expect(parseNetworkComparisonInput()).toEqual({ok:true,value:{compare:true}}));
it("keeps missing fields distinct from zero and rejects malformed scalar values",()=>{expect(unsigned(0)).toBe(0);expect(unsigned(undefined)).toBe(null);expect(unsigned(-1)).toBe(null);expect(unsigned(4294967296)).toBe(null);expect(integerString("9007199254740993")).toBe("9007199254740993");expect(integerString("0100")).toBe("100");expect(integerString(0.1)).toBe(null);expect(record([])).toBe(null);});
