import {expect,it} from "vitest";
import {parseInput} from "../schema";
import {sample} from "../fixtures/priceFractionLab.fixture";
it("rejects zero, exponent syntax, zero denominator and oversized values",()=>{expect(parseInput({mode:"Fraction",numerator:"1",denominator:"0"})).toEqual({ok:false,code:"zero_denominator"});for(const decimal of ["0","1e-7","-1",".1","1."])expect(parseInput({mode:"Decimal",decimal}).ok).toBe(false);expect(parseInput({mode:"Decimal",decimal:"1".repeat(101)})).toEqual({ok:false,code:"input_too_large"});expect(parseInput({mode:"Decimal",decimal:"1",precision:"19"})).toEqual({ok:false,code:"invalid_input"});});
it("parses decimal fractions without float coercion",()=>{expect(parseInput({mode:"Decimal",decimal:"0.125",precision:"18"})).toEqual({ok:true,value:{n:125n,d:1000n,precision:18}});expect(parseInput(sample).ok).toBe(true);expect(parseInput({})).toEqual({ok:false,code:"empty_input"});});
