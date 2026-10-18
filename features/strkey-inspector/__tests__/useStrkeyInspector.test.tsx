import {expect,it} from "vitest";
import {act,renderHook} from "@testing-library/react";
import {withMswHandlers} from "@/core/testing/msw";
import {useStrkeyInspector} from "../hooks/useStrkeyInspector";
import {sample} from "../fixtures/strkeyInspector.fixture";
withMswHandlers();
it("runs and resets without retaining raw input",async()=>{const {result}=renderHook(useStrkeyInspector);expect(result.current.state.status).toBe("idle");let pending:Promise<void>;act(()=>{pending=result.current.submit(sample);});expect(result.current.state.status).toBe("loading");await act(async()=>pending);expect(result.current.state.status).toBe("success");act(()=>result.current.reset());expect(result.current.state).toEqual({status:"idle"});});
it("reset prevents stale completion",async()=>{const {result}=renderHook(useStrkeyInspector);let pending:Promise<void>;act(()=>{pending=result.current.submit(sample);result.current.reset();});await act(async()=>pending);expect(result.current.state.status).toBe("idle");});
it("invalid newer submission supersedes earlier results",async()=>{const {result}=renderHook(useStrkeyInspector);let pending:Promise<void>;act(()=>{pending=result.current.submit(sample);});await act(()=>result.current.submit({}));await act(async()=>pending);expect(result.current.state.status).toBe("error");});
