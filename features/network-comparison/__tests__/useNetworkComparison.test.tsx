import {expect,it} from "vitest";
import {act,renderHook} from "@testing-library/react";
import {NetworkProvider,useNetwork} from "@/core/network/NetworkProvider";
import {withMswHandlers,http,HttpResponse,delay} from "@/core/testing/msw";
import {horizonUrl} from "@/core/horizon/client";
import {handlers} from "../msw/handlers";
import {rootFixture} from "../fixtures/networkComparison.fixture";
import {useNetworkComparison} from "../hooks/useNetworkComparison";
const server=withMswHandlers(...handlers);
const wrapper=({children}:{children:React.ReactNode})=><NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
it("has loading/success/reset states and ignores the header network switch",async()=>{
 const {result}=renderHook(()=>({tool:useNetworkComparison(),network:useNetwork()}),{wrapper});expect(result.current.tool.state.status).toBe("idle");let pending:Promise<void>;act(()=>{pending=result.current.tool.submit();});expect(result.current.tool.state.status).toBe("loading");await act(async()=>pending);const previous=result.current.tool.state;act(()=>result.current.network.setNetwork("mainnet"));expect(result.current.tool.state).toBe(previous);act(()=>result.current.tool.reset());expect(result.current.tool.state.status).toBe("idle");
});
it("reset discards delayed observations",async()=>{server.use(http.get(horizonUrl("testnet","/"),async()=>{await delay(50);return HttpResponse.json(rootFixture);}));const {result}=renderHook(useNetworkComparison,{wrapper});let pending:Promise<void>;act(()=>{pending=result.current.submit();});act(()=>result.current.reset());await act(async()=>pending);expect(result.current.state.status).toBe("idle");});
it("reports both-network failure",async()=>{server.use(http.get(horizonUrl("testnet","/"),()=>HttpResponse.error()),http.get(horizonUrl("mainnet","/"),()=>HttpResponse.error()));const {result}=renderHook(useNetworkComparison,{wrapper});await act(()=>result.current.submit());expect(result.current.state).toEqual({status:"error",code:"both_unreachable"});});
