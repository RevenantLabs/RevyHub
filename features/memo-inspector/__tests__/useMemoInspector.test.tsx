import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useMemoInspector } from "@/features/memo-inspector/hooks/useMemoInspector";
import {
  hashBytes,
  hashForm,
  idForm,
  maxMemoId,
  noneForm,
  overMaxMemoId,
  returnForm,
  shortHashHex,
  textForm,
  textOverByteLimit
} from "@/features/memo-inspector/fixtures/memoInspector.fixture";

describe("useMemoInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useMemoInspector());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("passes through the encoding state on its way to success", async () => {
    const { result } = renderHook(() => useMemoInspector());

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.submit(textForm);
    });
    expect(result.current.state.status).toBe("encoding");

    await act(async () => {
      await pending;
    });
    expect(result.current.state.status).toBe("success");
  });

  it("encodes each memo type and decodes it back", async () => {
    const { result } = renderHook(() => useMemoInspector());

    for (const form of [noneForm, textForm, idForm, hashForm, returnForm]) {
      await act(async () => {
        await result.current.submit(form);
      });
      await waitFor(() => expect(result.current.state.status).toBe("success"));
      if (result.current.state.status !== "success") throw new Error("not a success state");

      expect(result.current.state.encoding.kind).toBe(form.kind);
      expect(result.current.state.decoded.kind).toBe(form.kind);
    }
  });

  it("keeps a memo id at the top of the uint64 range as a BigInt", async () => {
    const { result } = renderHook(() => useMemoInspector());

    await act(async () => {
      await result.current.submit({ kind: "id", value: maxMemoId });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      input: { kind: "id", id: 2n ** 64n - 1n },
      decoded: { value: maxMemoId }
    });
  });

  it("records how a hash was written", async () => {
    const { result } = renderHook(() => useMemoInspector());

    await act(async () => {
      await result.current.submit(returnForm);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      input: { kind: "return", encoding: "base64", hash: hashBytes }
    });
  });

  it.each([
    [{ kind: "text", value: "" }, "empty_input", "value"],
    [{ kind: "text", value: textOverByteLimit }, "text_too_long", "value"],
    [{ kind: "id", value: overMaxMemoId }, "invalid_id", "value"],
    [{ kind: "hash", value: shortHashHex }, "invalid_hash", "value"],
    [{ kind: "postcard", value: "x" }, "unsupported_type", "kind"]
  ])("reports %o as a specific error", async (form, code, field) => {
    const { result } = renderHook(() => useMemoInspector());

    await act(async () => {
      await result.current.submit(form);
    });

    expect(result.current.state).toEqual({ status: "error", code, field });
  });

  it("clears the result on reset", async () => {
    const { result } = renderHook(() => useMemoInspector());

    await act(async () => {
      await result.current.submit(textForm);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
