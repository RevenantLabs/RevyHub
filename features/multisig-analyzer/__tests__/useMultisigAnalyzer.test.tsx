import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useMultisigAnalyzer } from "@/features/multisig-analyzer/hooks/useMultisigAnalyzer";
import { buildTestEnvelope, sourceAccountId, transactionSourceAccountId } from "@/features/multisig-analyzer/fixtures/multisigAnalyzer.fixture";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useMultisigAnalyzer", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useMultisigAnalyzer(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("moves from idle to success when a valid envelope is submitted", async () => {
    const { result } = renderHook(() => useMultisigAnalyzer(), { wrapper });
    const envelope = buildTestEnvelope({ sourceAccountId: transactionSourceAccountId });

    await act(async () => {
      await result.current.submit({ envelope, sourceAccount: sourceAccountId });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useMultisigAnalyzer(), { wrapper });
    await act(async () => {
      await result.current.submit({ envelope: "", sourceAccount: "" });
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });
});
