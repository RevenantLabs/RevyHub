import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useLiquidityPoolIdCalculator } from "../hooks/useLiquidityPoolIdCalculator";
import { sample } from "../fixtures/liquidityPoolIdCalculator.fixture";

it("starts idle", () => {
  const { result } = renderHook(() => useLiquidityPoolIdCalculator());
  expect(result.current.state.status).toBe("idle");
});

it("computes a pool ID synchronously", () => {
  const { result } = renderHook(() => useLiquidityPoolIdCalculator());
  act(() => result.current.submit(sample));
  expect(result.current.state.status).toBe("success");
});

it("reports identical_assets for two identical assets", () => {
  const { result } = renderHook(() => useLiquidityPoolIdCalculator());
  act(() =>
    result.current.submit({ ...sample, assetYCode: sample.assetXCode, assetYIssuer: sample.assetXIssuer })
  );
  expect(result.current.state.status).toBe("error");
  expect(result.current.state.status === "error" && result.current.state.code).toBe("identical_assets");
});

it("resets to idle", () => {
  const { result } = renderHook(() => useLiquidityPoolIdCalculator());
  act(() => result.current.submit(sample));
  act(() => result.current.reset());
  expect(result.current.state.status).toBe("idle");
});
