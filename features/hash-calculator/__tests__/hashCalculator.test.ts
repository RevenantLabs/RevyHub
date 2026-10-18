import {expect,it} from "vitest";
import {withMswHandlers} from "@/core/testing/msw";
import {parseInput} from "../schema";
import {analyze} from "../lib/hashCalculator";
import {sample} from "../fixtures/hashCalculator.fixture";
withMswHandlers();
import {envelope} from "../fixtures/hashCalculator.fixture";
it.each([["UTF-8","abc"],["Hex","616263"],["Base64","YWJj"]])("hashes equivalent bytes in %s",async(encoding,value)=>{const p=parseInput({...sample,encoding,value});if(p.ok){const r=await analyze(p.value);expect(r.ok&&r.value.values).toMatchObject({hex:"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",base64:"ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=",bytes:"3"});}else throw new Error(p.code);});
it("changes transaction hash with standard or exact custom passphrase",async()=>{const hashes=[];for(const network of ["Testnet","Mainnet","Custom"]){const p=parseInput({...sample,mode:"Transaction",value:envelope,network,passphrase:"Custom network"});if(p.ok){const r=await analyze(p.value);expect(r.ok).toBe(true);if(r.ok)hashes.push(r.value.values.hex);}}expect(new Set(hashes).size).toBe(3);});
it("reports absent Web Crypto without throwing",async()=>{vi.stubGlobal("crypto",{});expect(await analyze({mode:"SHA-256",bytes:new Uint8Array([1])})).toEqual({ok:false,code:"crypto_unavailable"});});
it("maps malformed domain envelope without throwing",async()=>expect(await analyze({mode:"Transaction",value:"invalid",passphrase:"network"})).toEqual({ok:false,code:"invalid_xdr"}));

import {webcrypto} from "node:crypto";
import {beforeEach,afterEach,vi} from "vitest";
beforeEach(()=>vi.stubGlobal("crypto",webcrypto));afterEach(()=>vi.unstubAllGlobals());
