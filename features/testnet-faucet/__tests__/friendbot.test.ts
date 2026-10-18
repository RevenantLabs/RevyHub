import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  classifyFriendbotResponse,
  friendbotUrl,
  fundTestnetAccount
} from "@/features/testnet-faucet/lib/friendbot";
import {
  handlers,
  unavailableHandler,
  unparseableSuccessHandler
} from "@/features/testnet-faucet/msw/handlers";
import {
  fundedAccountId,
  newAccountId,
  rateLimitedAccountId
} from "@/features/testnet-faucet/fixtures/testnetFaucet.fixture";

const server = withMswHandlers(...handlers);

describe("friendbotUrl", () => {
  it("encodes the address as the addr parameter", () => {
    expect(friendbotUrl(newAccountId)).toBe(
      `https://friendbot.stellar.org/?addr=${newAccountId}`
    );
  });
});

describe("classifyFriendbotResponse", () => {
  it("reads 429 as rate limiting", async () => {
    expect(await classifyFriendbotResponse(new Response("", { status: 429 }))).toBe(
      "rate_limited"
    );
  });

  it("reads any 5xx as the faucet being unavailable", async () => {
    expect(await classifyFriendbotResponse(new Response("", { status: 503 }))).toBe(
      "friendbot_unavailable"
    );
  });

  it("distinguishes 'already funded' from a generic 400 by the body", async () => {
    const alreadyFunded = new Response('{"detail":"op_already_exists"}', { status: 400 });
    const generic = new Response("something else", { status: 400 });

    expect(await classifyFriendbotResponse(alreadyFunded)).toBe("already_funded");
    expect(await classifyFriendbotResponse(generic)).toBe("request_failed");
  });
});

describe("fundTestnetAccount", () => {
  it("funds a new account and reports the transaction", async () => {
    const result = await fundTestnetAccount({ accountId: newAccountId });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.transactionHash).toHaveLength(64);
    expect(result.value.ledger).toBe(1017700);
  });

  it("reports an account that already exists", async () => {
    const result = await fundTestnetAccount({ accountId: fundedAccountId });
    expect(result).toEqual({ ok: false, code: "already_funded" });
  });

  it("reports rate limiting", async () => {
    const result = await fundTestnetAccount({ accountId: rateLimitedAccountId });
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("reports the faucet being down", async () => {
    server.use(unavailableHandler);
    const result = await fundTestnetAccount({ accountId: newAccountId });
    expect(result).toEqual({ ok: false, code: "friendbot_unavailable" });
  });

  it("still succeeds when the success body cannot be parsed", async () => {
    server.use(unparseableSuccessHandler);
    const result = await fundTestnetAccount({ accountId: newAccountId });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.transactionHash).toBeUndefined();
  });
});
