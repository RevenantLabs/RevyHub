import {expect,it} from "vitest";
import {parseInput} from "../schema";
import {sample} from "../fixtures/trustlineLimitPlanner.fixture";
import {row} from "../fixtures/trustlineLimitPlanner.fixture";
it("requires all commitments instead of guessing absent liabilities",()=>{expect(parseInput({...sample,snapshot:JSON.stringify({...row,buying_liabilities:undefined})})).toEqual({ok:false,code:"incomplete_snapshot"});});
it.each(["native","liquidity_pool_shares"])("explains unsupported balance type %s",asset_type=>expect(parseInput({...sample,snapshot:JSON.stringify({asset_type})})).toEqual({ok:false,code:"unsupported_balance_type"}));
it("checks amount and encoding bounds",()=>{for(const limit of ["-1","1e2","0.00000001","922337203685.4775808"])expect(parseInput({...sample,limit})).toEqual({ok:false,code:"invalid_limit"});expect(parseInput({...sample,snapshot:"{"})).toEqual({ok:false,code:"invalid_input"});expect(parseInput({...sample,snapshot:" ".repeat(65536)+"{}"})).toEqual({ok:false,code:"input_too_large"});expect(parseInput({})).toEqual({ok:false,code:"empty_input"});expect(parseInput({...sample,snapshot:JSON.stringify({...row,asset_issuer:"Ssecret"})})).toEqual({ok:false,code:"invalid_input"});});
