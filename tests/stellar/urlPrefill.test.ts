import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { sanitizeAddressParam } from "../../app/tools/address-validator/page";
import { sanitizeHashParam } from "../../app/tools/transaction-lookup/page";
import {
  sanitizeAccountParam,
  sanitizeAssetCodeParam,
  sanitizeIssuerParam
} from "../../app/tools/trustline-checker/page";

describe("sanitizeAddressParam", () => {
  it("accepts a plausible address within the length limit", () => {
    const address = Keypair.random().publicKey();

    expect(sanitizeAddressParam(address)).toBe(address);
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeAddressParam("  GTEST  ")).toBe("GTEST");
  });

  it("ignores a missing parameter", () => {
    expect(sanitizeAddressParam(null)).toBeNull();
  });

  it("rejects an empty or whitespace-only parameter", () => {
    expect(sanitizeAddressParam("")).toBeNull();
    expect(sanitizeAddressParam("   ")).toBeNull();
  });

  it("rejects a parameter longer than 100 characters", () => {
    expect(sanitizeAddressParam("G".repeat(101))).toBeNull();
  });

  it("rejects a parameter with control characters", () => {
    expect(sanitizeAddressParam("GTEST\nDROP TABLE")).toBeNull();
  });
});

describe("sanitizeHashParam", () => {
  it("accepts a plausible transaction hash", () => {
    const hash = "a".repeat(64);

    expect(sanitizeHashParam(hash)).toBe(hash);
  });

  it("ignores a missing parameter", () => {
    expect(sanitizeHashParam(null)).toBeNull();
  });

  it("rejects a parameter longer than 100 characters", () => {
    expect(sanitizeHashParam("a".repeat(101))).toBeNull();
  });

  it("rejects a parameter with control characters", () => {
    expect(sanitizeHashParam("abc\tdef")).toBeNull();
  });
});

describe("sanitizeAccountParam / sanitizeIssuerParam", () => {
  it("accepts a plausible account address", () => {
    const account = Keypair.random().publicKey();

    expect(sanitizeAccountParam(account)).toBe(account);
    expect(sanitizeIssuerParam(account)).toBe(account);
  });

  it("ignores a missing parameter", () => {
    expect(sanitizeAccountParam(null)).toBeNull();
    expect(sanitizeIssuerParam(null)).toBeNull();
  });

  it("rejects a parameter longer than 100 characters", () => {
    expect(sanitizeAccountParam("G".repeat(101))).toBeNull();
    expect(sanitizeIssuerParam("G".repeat(101))).toBeNull();
  });
});

describe("sanitizeAssetCodeParam", () => {
  it("accepts a plausible asset code", () => {
    expect(sanitizeAssetCodeParam("USDC")).toBe("USDC");
  });

  it("ignores a missing parameter", () => {
    expect(sanitizeAssetCodeParam(null)).toBeNull();
  });

  it("rejects a parameter longer than 32 characters", () => {
    expect(sanitizeAssetCodeParam("A".repeat(33))).toBeNull();
  });

  it("rejects a parameter with control characters", () => {
    expect(sanitizeAssetCodeParam("US\nDC")).toBeNull();
  });
});
