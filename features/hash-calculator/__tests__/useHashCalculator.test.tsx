import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useHashCalculator } from "@/features/hash-calculator/hooks/useHashCalculator";
import {
  expectedPublicHashHex,
  expectedTestnetHashHex,
  invalidHexOdd,
  invalidXdrString,
  textVector,
  validEnvelopeXdr
} from "@/features/hash-calculator/fixtures/hashCalculator.fixture";

describe("useHashCalculator", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useHashCalculator());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("transitions through loading to success when computing raw data", async () => {
    const { result } = renderHook(() => useHashCalculator());

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.submit({
        mode: "data",
        data: textVector.input,
        encoding: "utf8",
        envelope: "",
        passphrasePreset: "testnet",
        customPassphrase: ""
      });
    });

    expect(result.current.state.status).toBe("loading");

    await act(async () => {
      await pending;
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.hashHex).toBe(textVector.expectedHex);
    }
  });

  it("transitions to success when computing transaction hash", async () => {
    const { result } = renderHook(() => useHashCalculator());

    await act(async () => {
      await result.current.submit({
        mode: "transaction",
        data: "",
        encoding: "utf8",
        envelope: validEnvelopeXdr,
        passphrasePreset: "testnet",
        customPassphrase: ""
      });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status === "success") {
      expect(result.current.state.result.hashHex).toBe(expectedTestnetHashHex);
    }
  });

  it("supports one-click passphrase switching on transaction results", async () => {
    const { result } = renderHook(() => useHashCalculator());

    await act(async () => {
      await result.current.submit({
        mode: "transaction",
        data: "",
        encoding: "utf8",
        envelope: validEnvelopeXdr,
        passphrasePreset: "testnet",
        customPassphrase: ""
      });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status === "success") {
      expect(result.current.state.result.hashHex).toBe(expectedTestnetHashHex);
    }

    await act(async () => {
      await result.current.switchPassphrase("public");
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status === "success") {
      expect(result.current.state.result.hashHex).toBe(expectedPublicHashHex);
    }
  });

  it("reports empty_input when submitting blank data", async () => {
    const { result } = renderHook(() => useHashCalculator());

    await act(async () => {
      await result.current.submit({
        mode: "data",
        data: "   ",
        encoding: "utf8",
        envelope: "",
        passphrasePreset: "testnet",
        customPassphrase: ""
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "empty_input"
    });
  });

  it("reports invalid_encoding on malformed hex input", async () => {
    const { result } = renderHook(() => useHashCalculator());

    await act(async () => {
      await result.current.submit({
        mode: "data",
        data: invalidHexOdd,
        encoding: "hex",
        envelope: "",
        passphrasePreset: "testnet",
        customPassphrase: ""
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_encoding"
    });
  });

  it("reports invalid_xdr on malformed transaction envelope", async () => {
    const { result } = renderHook(() => useHashCalculator());

    await act(async () => {
      await result.current.submit({
        mode: "transaction",
        data: "",
        encoding: "utf8",
        envelope: invalidXdrString,
        passphrasePreset: "testnet",
        customPassphrase: ""
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_xdr"
    });
  });

  it("resets state back to idle", async () => {
    const { result } = renderHook(() => useHashCalculator());

    await act(async () => {
      await result.current.submit("hello");
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
