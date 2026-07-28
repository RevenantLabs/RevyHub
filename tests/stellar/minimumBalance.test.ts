import { describe, expect, it, vi, beforeEach } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { getMinimumBalance } from "../../lib/stellar/account";

const MOCK_BASE_RESERVE = 0.5;

// Generate a deterministic valid public key for test fixtures
const testKeypair = Keypair.random();
const testPublicKey = testKeypair.publicKey();

// Helpers to build deterministic Horizon account fixtures
function makeBaseAccount(overrides: Record<string, unknown> = {}) {
  return {
    id: testPublicKey,
    account_id: testPublicKey,
    sequence: "1",
    subentry_count: 0,
    num_sponsoring: 0,
    num_sponsored: 0,
    last_modified_ledger: 12345,
    balances: [{ asset_type: "native", balance: "100" }],
    ...overrides
  };
}

// Spy helpers for mocks that close over variables reassigned in beforeEach
let loadAccountMock: ReturnType<typeof vi.fn>;
let getBaseReserveMock: ReturnType<typeof vi.fn>;

vi.mock("@/lib/stellar/horizon", () => ({
  getHorizonServer: vi.fn(() => ({
    loadAccount: loadAccountMock
  })),
  getBaseReserve: vi.fn(() => getBaseReserveMock()),
  STELLAR_NETWORK: "testnet"
}));

describe("getMinimumBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadAccountMock = vi.fn();
    getBaseReserveMock = vi.fn().mockResolvedValue(MOCK_BASE_RESERVE);
  });

  it("rejects an invalid public key", async () => {
    await expect(getMinimumBalance("not-an-address")).rejects.toThrow(/start with G/);
  });

  it("rejects empty input", async () => {
    await expect(getMinimumBalance("   ")).rejects.toThrow(/Enter a Stellar public address/);
  });

  describe("basic account", () => {
    it("calculates the minimum balance for a fresh unfunded account", async () => {
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 0,
          balances: [{ asset_type: "native", balance: "1" }]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      expect(result.baseReserve).toBe(0.5);
      expect(result.subentryCount).toBe(0);
      expect(result.numSponsoring).toBe(0);
      expect(result.numSponsored).toBe(0);
      // (2 + 0 + 0 - 0) * 0.5 = 1
      expect(result.minimumBalance).toBe("1");
      expect(result.nativeBalance).toBe("1");
      expect(result.potentiallySpendable).toBe("0");
      expect(result.formula).toBe("(2 + 0 + 0 - 0) × 0.5 = 1 XLM");
    });

    it("calculates minimum balance for an account with only native XLM", async () => {
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 0,
          balances: [{ asset_type: "native", balance: "100" }]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      expect(result.minimumBalance).toBe("1");
      expect(result.nativeBalance).toBe("100");
      expect(result.potentiallySpendable).toBe("99");
    });
  });

  describe("trustline-heavy account", () => {
    it("accounts for multiple subentries (trustlines, offers, data)", async () => {
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 8,
          balances: [
            { asset_type: "native", balance: "50" },
            { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "G...", balance: "200" }
          ]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      // (2 + 8) * 0.5 = 5
      expect(result.minimumBalance).toBe("5");
      expect(result.nativeBalance).toBe("50");
      expect(result.potentiallySpendable).toBe("45");
      expect(result.subentryCount).toBe(8);
    });
  });

  describe("sponsored accounts", () => {
    it("increases minimum balance for sponsoring entries", async () => {
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 3,
          num_sponsoring: 2,
          num_sponsored: 0,
          balances: [{ asset_type: "native", balance: "20" }]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      // (2 + 3 + 2 - 0) * 0.5 = 3.5
      expect(result.minimumBalance).toBe("3.5");
      expect(result.potentiallySpendable).toBe("16.5");
    });

    it("reduces minimum balance for sponsored entries", async () => {
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 5,
          num_sponsoring: 0,
          num_sponsored: 3,
          balances: [{ asset_type: "native", balance: "10" }]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      // (2 + 5 + 0 - 3) * 0.5 = 2
      expect(result.minimumBalance).toBe("2");
      expect(result.potentiallySpendable).toBe("8");
    });

    it("handles mixed sponsoring and sponsored entries", async () => {
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 10,
          num_sponsoring: 4,
          num_sponsored: 6,
          balances: [{ asset_type: "native", balance: "50" }]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      // (2 + 10 + 4 - 6) * 0.5 = 5
      expect(result.minimumBalance).toBe("5");
    });
  });

  describe("decimal precision", () => {
    it("avoids JavaScript floating-point rounding via stroop arithmetic", async () => {
      // 0.1 + 0.2 = 0.30000000000000004 in JS, but not with stroop conversion
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 0,
          balances: [{ asset_type: "native", balance: "1.3" }]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      // 1.3 - 1.0 = 0.3
      expect(result.minimumBalance).toBe("1");
      expect(result.nativeBalance).toBe("1.3");
      expect(result.potentiallySpendable).toBe("0.3");
    });

    it("handles balances with seven decimal places", async () => {
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 0,
          balances: [{ asset_type: "native", balance: "0.1234567" }]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      expect(result.nativeBalance).toBe("0.1234567");
      // Minimum is 1.0, so spendable is 0
      expect(result.potentiallySpendable).toBe("0");
    });

    it("produces clean decimals for values with trailing zeroes", async () => {
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 0,
          balances: [{ asset_type: "native", balance: "2.5000000" }]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      expect(result.nativeBalance).toBe("2.5");
    });
  });

  describe("safe fallbacks", () => {
    it("defaults missing subentry_count to 0", async () => {
      const account = makeBaseAccount({ subentry_count: 0 });
      delete (account as Record<string, unknown>).subentry_count;

      loadAccountMock.mockResolvedValue(account);

      const result = await getMinimumBalance(testPublicKey);

      expect(result.subentryCount).toBe(0);
      expect(result.minimumBalance).toBe("1");
    });

    it("defaults missing num_sponsoring and num_sponsored to 0", async () => {
      const account = makeBaseAccount({ subentry_count: 2 });
      delete (account as Record<string, unknown>).num_sponsoring;
      delete (account as Record<string, unknown>).num_sponsored;

      loadAccountMock.mockResolvedValue(account);

      const result = await getMinimumBalance(testPublicKey);

      expect(result.numSponsoring).toBe(0);
      expect(result.numSponsored).toBe(0);
      // (2 + 2 + 0 - 0) * 0.5 = 2
      expect(result.minimumBalance).toBe("2");
    });

    it("defaults missing last_modified_ledger to 0", async () => {
      const account = makeBaseAccount({ subentry_count: 0 });
      delete (account as Record<string, unknown>).last_modified_ledger;

      loadAccountMock.mockResolvedValue(account);

      const result = await getMinimumBalance(testPublicKey);

      expect(result.lastModifiedLedger).toBe(0);
    });

    it("handles zero native balance when no native asset exists", async () => {
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 0,
          balances: []
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      expect(result.nativeBalance).toBe("0");
      expect(result.potentiallySpendable).toBe("0");
      expect(result.minimumBalance).toBe("1");
    });
  });

  describe("network-aware base reserve", () => {
    it("uses the base reserve from getBaseReserve when available", async () => {
      getBaseReserveMock.mockResolvedValue(0.25);
      loadAccountMock.mockResolvedValue(
        makeBaseAccount({
          subentry_count: 2,
          balances: [{ asset_type: "native", balance: "10" }]
        })
      );

      const result = await getMinimumBalance(testPublicKey);

      // (2 + 2) * 0.25 = 1
      expect(result.baseReserve).toBe(0.25);
      expect(result.minimumBalance).toBe("1");
      expect(result.potentiallySpendable).toBe("9");
    });
  });
});
