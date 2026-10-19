import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { flushSync } from "react-dom";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { useLedgerHeaderDecoder } from "@/features/ledger-header-decoder/hooks/useLedgerHeaderDecoder";
import { ledgerHeaderXdr } from "@/features/ledger-header-decoder/fixtures/ledgerHeaderDecoder.fixture";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useLedgerHeaderDecoder", () => {
  it("transitions idle → loading → success and reset", async () => {
    const { result } = renderHook(() => useLedgerHeaderDecoder(), { wrapper });
    expect(result.current.state.status).toBe("idle");
    flushSync(() => result.current.submit(ledgerHeaderXdr));
    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
  it("reports an error, then allows retry", async () => {
    const { result } = renderHook(() => useLedgerHeaderDecoder(), { wrapper });
    act(() => result.current.submit("AAAA"));
    await waitFor(() => expect(result.current.state).toEqual({ status: "error", code: "malformed_header" }));
    act(() => result.current.submit(ledgerHeaderXdr));
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });
  it("keeps decoded data after network selection changes", async () => {
    const { result } = renderHook(() => ({ decoder: useLedgerHeaderDecoder(), network: useNetwork() }), { wrapper });
    act(() => result.current.decoder.submit(ledgerHeaderXdr));
    await waitFor(() => expect(result.current.decoder.state.status).toBe("success"));
    act(() => result.current.network.setNetwork("mainnet"));
    expect(result.current.decoder.state.status).toBe("success");
  });
});
