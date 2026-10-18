import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { withMswHandlers } from "@/core/testing/msw";
import { useFederationResolver } from "@/features/federation-resolver/hooks/useFederationResolver";
import {
  federationHandler,
  handlers,
  tomlMissingHandler
} from "@/features/federation-resolver/msw/handlers";
import {
  DOMAIN,
  recordWithoutMemo,
  resolvedAccountId
} from "@/features/federation-resolver/fixtures/federationResolver.fixture";

const server = withMswHandlers(...handlers);

describe("useFederationResolver", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useFederationResolver());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("resolves a known address", async () => {
    const { result } = renderHook(() => useFederationResolver());

    await act(async () => {
      await result.current.submit(`alice*${DOMAIN}`);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      resolution: { record: { accountId: resolvedAccountId, memoType: "id" } }
    });
  });

  it("rejects bad syntax before making any request", async () => {
    const { result } = renderHook(() => useFederationResolver());

    await act(async () => {
      await result.current.submit("no-asterisk");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_syntax" });
  });

  it("reports a domain without a stellar.toml", async () => {
    server.use(tomlMissingHandler);
    const { result } = renderHook(() => useFederationResolver());

    await act(async () => {
      await result.current.submit(`alice*${DOMAIN}`);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "toml_not_found" })
    );
  });

  it("resolves an address that needs no memo", async () => {
    server.use(federationHandler(recordWithoutMemo));
    const { result } = renderHook(() => useFederationResolver());

    await act(async () => {
      await result.current.submit(`bob*${DOMAIN}`);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.resolution.record.memo).toBeUndefined();
  });

  it("clears the resolution on reset", async () => {
    const { result } = renderHook(() => useFederationResolver());

    await act(async () => {
      await result.current.submit(`alice*${DOMAIN}`);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
