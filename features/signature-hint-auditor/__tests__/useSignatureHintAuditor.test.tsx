import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSignatureHintAuditor } from "@/features/signature-hint-auditor/hooks/useSignatureHintAuditor";
import {
  feeBumpXdr,
  notBase64,
  secretSeed,
  signedClassicXdr,
  source
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";

describe("useSignatureHintAuditor", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSignatureHintAuditor());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reports a successful audit", () => {
    const { result } = renderHook(() => useSignatureHintAuditor());

    act(() =>
      result.current.submit({
        envelope: signedClassicXdr,
        publicSigners: source.publicKey()
      })
    );

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      result: { signatureCount: 1, collisionCount: 0 }
    });
  });

  it("surfaces empty_xdr for a blank envelope", () => {
    const { result } = renderHook(() => useSignatureHintAuditor());

    act(() => result.current.submit({ envelope: "   ", publicSigners: "" }));

    expect(result.current.state).toEqual({ status: "error", code: "empty_xdr" });
  });

  it("surfaces invalid_xdr for a bad paste", () => {
    const { result } = renderHook(() => useSignatureHintAuditor());

    act(() => result.current.submit({ envelope: notBase64, publicSigners: "" }));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_xdr" });
  });

  it("surfaces invalid_public_signer for a bad key list", () => {
    const { result } = renderHook(() => useSignatureHintAuditor());

    act(() =>
      result.current.submit({ envelope: signedClassicXdr, publicSigners: "GNOTAKEY" })
    );

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_public_signer"
    });
  });

  it("never keeps a pasted secret in hook state, and asks for a redaction", () => {
    const { result } = renderHook(() => useSignatureHintAuditor());

    expect(result.current.redactions).toBe(0);

    act(() => result.current.submit({ envelope: secretSeed, publicSigners: "" }));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_xdr" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.redactions).toBe(1);
  });

  it("redacts when a secret appears in the signer field", () => {
    const { result } = renderHook(() => useSignatureHintAuditor());

    act(() =>
      result.current.submit({ envelope: signedClassicXdr, publicSigners: secretSeed })
    );

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_public_signer"
    });
    expect(result.current.redactions).toBe(1);
  });

  it("replaces a previous result rather than leaving it on screen", () => {
    const { result } = renderHook(() => useSignatureHintAuditor());

    act(() =>
      result.current.submit({ envelope: signedClassicXdr, publicSigners: "" })
    );
    expect(result.current.state.status).toBe("success");

    act(() => result.current.submit({ envelope: notBase64, publicSigners: "" }));
    expect(result.current.state.status).toBe("error");
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useSignatureHintAuditor());

    act(() => result.current.submit({ envelope: feeBumpXdr, publicSigners: "" }));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
