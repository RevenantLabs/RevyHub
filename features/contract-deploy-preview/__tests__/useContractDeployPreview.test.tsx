import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useContractDeployPreview } from "../hooks/useContractDeployPreview";
import { sample } from "../fixtures/contractDeployPreview.fixture";

it("starts idle", () => {
  const { result } = renderHook(() => useContractDeployPreview());
  expect(result.current.state.status).toBe("idle");
});

it("decodes a valid envelope synchronously", () => {
  const { result } = renderHook(() => useContractDeployPreview());
  act(() => result.current.submit(sample.envelope));
  expect(result.current.state.status).toBe("success");
});

it("reports empty_xdr for empty input", () => {
  const { result } = renderHook(() => useContractDeployPreview());
  act(() => result.current.submit(""));
  expect(result.current.state.status).toBe("error");
  expect(result.current.state.status === "error" && result.current.state.code).toBe("empty_xdr");
});

it("resets to idle", () => {
  const { result } = renderHook(() => useContractDeployPreview());
  act(() => result.current.submit(sample.envelope));
  act(() => result.current.reset());
  expect(result.current.state.status).toBe("idle");
});
