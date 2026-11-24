import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSignerRotationImpactAuditor } from "@/features/signer-rotation-impact-auditor/hooks/useSignerRotationImpactAuditor";
import {
  normalSnapshot,
  notBase64,
  PASSPHRASE,
  recoveredRotationXdr,
  safeRotationXdr,
  secretSeed
} from "@/features/signer-rotation-impact-auditor/fixtures/normal.fixture";

const base = {
  accountSnapshot: normalSnapshot,
  envelopeXdr: safeRotationXdr,
  networkPassphrase: PASSPHRASE
};

describe("useSignerRotationImpactAuditor", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSignerRotationImpactAuditor());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("audits a rotation into success", () => {
    const { result } = renderHook(() => useSignerRotationImpactAuditor());

    act(() => result.current.submit(base));

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.lockout.finalLockout).toBe(false);
  });

  it("clears a stale success when the next submit fails", () => {
    const { result } = renderHook(() => useSignerRotationImpactAuditor());

    act(() => result.current.submit(base));
    expect(result.current.state.status).toBe("success");

    act(() =>
      result.current.submit({
        ...base,
        envelopeXdr: notBase64
      })
    );

    expect(result.current.state).toEqual({ status: "error", code: "malformed_data" });
  });

  it("never keeps a pasted secret in hook state and asks for a redaction", () => {
    const { result } = renderHook(() => useSignerRotationImpactAuditor());

    expect(result.current.redactions).toBe(0);

    act(() =>
      result.current.submit({
        ...base,
        accountSnapshot: secretSeed
      })
    );

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.redactions).toBe(1);
  });

  it("surfaces recovered lockout through hook state", () => {
    const { result } = renderHook(() => useSignerRotationImpactAuditor());

    act(() =>
      result.current.submit({
        ...base,
        envelopeXdr: recoveredRotationXdr
      })
    );

    expect(result.current.state).toMatchObject({
      status: "success",
      result: { lockout: { recoveredFinal: true } }
    });
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useSignerRotationImpactAuditor());

    act(() => result.current.submit(base));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
