import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useContractUpgradeDiffReport } from "@/features/contract-upgrade-diff-report/hooks/useContractUpgradeDiffReport";
import { newWasm, oldWasm, wasmFile } from "@/features/contract-upgrade-diff-report/fixtures/normal.fixture";
import {
  componentModelWasm,
  noSpecWasm,
  overMaxWasm,
  secretSeed,
  secretSeedBytes
} from "@/features/contract-upgrade-diff-report/fixtures/boundary.fixture";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A file whose read only completes when the test says so. */
function slowFile(bytes: Uint8Array, name: string) {
  let release: (() => void) | undefined;
  const file = wasmFile(bytes, name);
  Object.defineProperty(file, "arrayBuffer", {
    value: () =>
      new Promise<ArrayBuffer>((resolve) => {
        release = () => resolve(Uint8Array.from(bytes).buffer);
      })
  });
  return { file, release: () => release?.() };
}

afterEach(() => vi.restoreAllMocks());

describe("useContractUpgradeDiffReport", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useContractUpgradeDiffReport());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("goes idle → loading → success and makes no request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useContractUpgradeDiffReport());
    const oldSlow = slowFile(oldWasm, "old.wasm");

    act(() => void result.current.submit({ oldFile: oldSlow.file, newFile: wasmFile(newWasm, "new.wasm") }));
    expect(result.current.state).toEqual({ status: "loading" });

    await act(async () => {
      oldSlow.release();
      await flush();
    });

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      report: { counts: { added: 1, removed: 1, changed: 3 }, interfaceComplete: true }
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports a missing file without entering loading", async () => {
    const { result } = renderHook(() => useContractUpgradeDiffReport());
    await act(async () => {
      await result.current.submit({ oldFile: wasmFile(oldWasm, "old.wasm"), newFile: null });
    });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_input", side: "new" });
  });

  it("reports an oversized file", async () => {
    const { result } = renderHook(() => useContractUpgradeDiffReport());
    await act(async () => {
      await result.current.submit({ oldFile: wasmFile(overMaxWasm, "big.wasm"), newFile: wasmFile(newWasm, "n.wasm") });
    });
    expect(result.current.state).toEqual({ status: "error", code: "too_large", side: "old" });
  });

  it("reports an unsupported binary against its side", async () => {
    const { result } = renderHook(() => useContractUpgradeDiffReport());
    await act(async () => {
      await result.current.submit({
        oldFile: wasmFile(oldWasm, "old.wasm"),
        newFile: wasmFile(componentModelWasm, "component.wasm")
      });
    });
    expect(result.current.state).toEqual({ status: "error", code: "unsupported_variant", side: "new" });
  });

  it("refuses a secret seed file and never keeps it in state", async () => {
    const { result } = renderHook(() => useContractUpgradeDiffReport());
    await act(async () => {
      await result.current.submit({
        oldFile: wasmFile(secretSeedBytes, "key.txt"),
        newFile: wasmFile(newWasm, "new.wasm")
      });
    });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_input", side: "old" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("succeeds with incomplete evidence rather than failing", async () => {
    const { result } = renderHook(() => useContractUpgradeDiffReport());
    await act(async () => {
      await result.current.submit({ oldFile: wasmFile(noSpecWasm, "old.wasm"), newFile: wasmFile(newWasm, "new.wasm") });
    });
    expect(result.current.state).toMatchObject({ status: "success", report: { interfaceComplete: false } });
  });

  it("never lets an obsolete read overwrite a newer result", async () => {
    const { result } = renderHook(() => useContractUpgradeDiffReport());
    const stale = slowFile(noSpecWasm, "stale.wasm");

    act(() => void result.current.submit({ oldFile: stale.file, newFile: wasmFile(newWasm, "new.wasm") }));
    await act(async () => {
      await result.current.submit({ oldFile: wasmFile(oldWasm, "fresh.wasm"), newFile: wasmFile(newWasm, "new.wasm") });
    });
    expect(result.current.state).toMatchObject({ status: "success", report: { old: { fileName: "fresh.wasm" } } });

    await act(async () => {
      stale.release();
      await flush();
    });
    expect(result.current.state).toMatchObject({ status: "success", report: { old: { fileName: "fresh.wasm" } } });
  });

  it("reset returns to idle and discards a read still in flight", async () => {
    const { result } = renderHook(() => useContractUpgradeDiffReport());
    const pending = slowFile(oldWasm, "old.wasm");

    act(() => void result.current.submit({ oldFile: pending.file, newFile: wasmFile(newWasm, "new.wasm") }));
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });

    await act(async () => {
      pending.release();
      await flush();
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
