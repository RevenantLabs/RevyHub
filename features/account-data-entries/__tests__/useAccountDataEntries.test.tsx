import { describe, expect, it } from "vitest";
import { renderHook, act } from "@/core/testing/render";
import { useAccountDataEntries } from "../hooks/useAccountDataEntries";
import { Keypair } from "@stellar/stellar-sdk";
import { withMswHandlers, http, HttpResponse } from "@/core/testing/msw";
import { NetworkProvider } from "@/core/network/NetworkProvider";

const server = withMswHandlers();
const wrapper = ({ children }: { children: React.ReactNode }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;

describe("useAccountDataEntries", () => {
  it("handles validation error", async () => {
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit("bad");
    });
    expect(result.current.error).toBe("Invalid Ed25519 public key format.");
    expect(result.current.result).toBeNull();
  });

  it("handles network error", async () => {
    const pub = Keypair.random().publicKey();
    server.use(http.get(`*/accounts/${pub}`, () => new HttpResponse(null, { status: 404 })));
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit(pub);
    });
    expect(result.current.error).toBe("Account not found on the network.");
  });

  it("handles success", async () => {
    const pub = Keypair.random().publicKey();
    server.use(http.get(`*/accounts/${pub}`, () => HttpResponse.json({ data: {} })));
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit(pub);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.result?.entries).toHaveLength(0);
  });
});
