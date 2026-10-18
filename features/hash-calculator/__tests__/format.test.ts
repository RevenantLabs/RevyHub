import {expect,it} from "vitest";
import {formatReport,stableJson} from "../lib/format";
it("exports deterministic local JSON with exact integers",()=>{expect(stableJson({z:9007199254740993n,a:1})).toBe(stableJson({a:1,z:"9007199254740993"}));expect(JSON.parse(formatReport({values:{},export:{amount:"0.0000001"}}))).toEqual({amount:"0.0000001"});});

import {webcrypto} from "node:crypto";
import {beforeEach,afterEach,vi} from "vitest";
beforeEach(()=>vi.stubGlobal("crypto",webcrypto));afterEach(()=>vi.unstubAllGlobals());
