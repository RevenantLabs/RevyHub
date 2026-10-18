import {expect,it,vi,afterEach} from "vitest";
import {withMswHandlers,http,HttpResponse} from "@/core/testing/msw";
import {horizonUrl} from "@/core/horizon/client";
import {handlers} from "../msw/handlers";
import {runNetworkComparison} from "../lib/networkComparison";
import {rootFixture,observedAt} from "../fixtures/networkComparison.fixture";
const server=withMswHandlers(...handlers);afterEach(()=>vi.useRealTimers());
it("compares protocol and fees without subtracting independent ledger heights",async()=>{
 vi.useFakeTimers({toFake:["Date"]});vi.setSystemTime(new Date(observedAt));const r=await runNetworkComparison();
 expect(r.ok && r.value).toMatchObject({partial:false,protocolDiffers:true,feeDiffers:false,reserveDiffers:false,testnet:{ok:true,value:{ledger:998,lag:2,observedAt}},mainnet:{ok:true,value:{ledger:60000000,lag:0,observedAt}}});
});
it("starts both network requests concurrently",async()=>{
 const started:string[]=[];let release:()=>void=()=>{};const barrier=new Promise<void>(resolve=>{release=resolve;});
 for(const network of ["testnet","mainnet"] as const)server.use(http.get(horizonUrl(network,"/"),async()=>{started.push(network);if(started.length===2)release();await barrier;return HttpResponse.json(rootFixture);}));
 expect((await runNetworkComparison()).ok).toBe(true);expect(started.sort()).toEqual(["mainnet","testnet"]);
});
it("preserves the working column if the other root or ledger fails",async()=>{
 server.use(http.get(horizonUrl("mainnet","/ledgers"),()=>HttpResponse.error()));const r=await runNetworkComparison();expect(r.ok && r.value).toMatchObject({partial:true,protocolDiffers:null,testnet:{ok:true},mainnet:{ok:false,code:"request_failed"}});
 server.use(http.get(horizonUrl("testnet","/"),()=>new HttpResponse(null,{status:503})));expect(await runNetworkComparison()).toEqual({ok:false,code:"both_unreachable"});
});
it("represents missing fields as unavailable and does not fabricate comparisons",async()=>{
 server.use(http.get(horizonUrl("testnet","/ledgers"),()=>HttpResponse.json({_embedded:{records:[{sequence:998}]}})));const r=await runNetworkComparison();expect(r.ok && r.value).toMatchObject({protocolDiffers:null,feeDiffers:null,testnet:{ok:true,value:{protocol:null,baseFee:null}}});
});
it("rejects malformed root and collection independently",async()=>{
 server.use(http.get(horizonUrl("testnet","/"),()=>HttpResponse.json({})),http.get(horizonUrl("mainnet","/ledgers"),()=>HttpResponse.json({_embedded:{records:[]}})));expect(await runNetworkComparison()).toEqual({ok:false,code:"both_unreachable"});
});
