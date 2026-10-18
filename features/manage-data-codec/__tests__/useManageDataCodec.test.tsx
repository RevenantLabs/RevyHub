import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useManageDataCodec } from "@/features/manage-data-codec/hooks/useManageDataCodec";
import {
  multibyteNameOverLimit,
  nonHexValue,
  secretSeed,
  simpleName,
  simpleValue
} from "@/features/manage-data-codec/fixtures/manageDataCodec.fixture";

const base = { mode: "set", name: simpleName, value: simpleValue, encoding: "utf8" } as const;

describe("useManageDataCodec", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useManageDataCodec());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("builds an entry from valid input", () => {
    const { result } = renderHook(() => useManageDataCodec());

    act(() => result.current.submit(base));

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      entry: { mode: "set", decoded: { valuePresent: true } }
    });
  });

  it("produces different entries for delete and for an empty value", () => {
    const { result } = renderHook(() => useManageDataCodec());

    act(() => result.current.submit({ ...base, mode: "delete" }));
    const deletion =
      result.current.state.status === "success" ? result.current.state.entry.operationXdr : "";

    act(() => result.current.submit({ ...base, value: "" }));
    const emptySet =
      result.current.state.status === "success" ? result.current.state.entry.operationXdr : "";

    expect(deletion).not.toBe("");
    expect(deletion).not.toBe(emptySet);
  });

  it("reports the field-specific failure rather than a generic one", () => {
    const { result } = renderHook(() => useManageDataCodec());

    act(() => result.current.submit({ ...base, name: multibyteNameOverLimit }));
    expect(result.current.state).toEqual({ status: "error", code: "name_too_long" });

    act(() => result.current.submit({ ...base, value: nonHexValue, encoding: "hex" }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_encoding" });
  });

  it("clears a stale entry when the next submission fails", () => {
    const { result } = renderHook(() => useManageDataCodec());

    act(() => result.current.submit(base));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.submit({ ...base, name: "" }));
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("never keeps a pasted secret in hook state, and asks for a redaction", () => {
    const { result } = renderHook(() => useManageDataCodec());

    expect(result.current.redactions).toBe(0);

    act(() => result.current.submit({ ...base, value: secretSeed }));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.redactions).toBe(1);
  });

  it("does not redact the field for an ordinary encoding mistake", () => {
    const { result } = renderHook(() => useManageDataCodec());

    act(() => result.current.submit({ ...base, value: nonHexValue, encoding: "hex" }));

    expect(result.current.redactions).toBe(0);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useManageDataCodec());

    act(() => result.current.submit(base));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
