import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSorobanAuthNonceExpiryAuditor } from "../hooks/useSorobanAuthNonceExpiryAuditor";
import { addressEntry, networkPassphrase } from "../fixtures/normal.fixture";
const raw = {bundle: addressEntry(), networkPassphrase, evaluationLedger: "100"};
describe("audit state", () => {
  it("goes idle, loading, success, reset", async () => {
    const {result} = renderHook(() => useSorobanAuthNonceExpiryAuditor());
    expect(result.current.state.status).toBe("idle");
    let pending!: Promise<void>;
    act(() => { pending = result.current.submit(raw); });
    expect(result.current.state.status).toBe("loading");
    await act(async () => { await pending; });
    expect(result.current.state.status).toBe("success");
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
  it("ignores an obsolete local result", async () => {
    const {result} = renderHook(() => useSorobanAuthNonceExpiryAuditor());
    let pending!: Promise<void>;
    act(() => { pending = result.current.submit(raw); result.current.reset(); });
    await act(async () => { await pending; });
    expect(result.current.state.status).toBe("idle");
  });
  it("reports invalid input and redacts pasted seeds", async () => {
    const {result} = renderHook(() => useSorobanAuthNonceExpiryAuditor());
    await act(async () => result.current.submit({...raw, bundle: "S" + "A".repeat(55)}));
    expect(result.current.state).toEqual({status: "error", code: "invalid_input"});
    expect(result.current.redactions).toBe(1);
  });
});
