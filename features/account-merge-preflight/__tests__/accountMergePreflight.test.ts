import { describe, expect, it } from "vitest";
import { runAccountMergePreflight } from "@/features/account-merge-preflight/lib/accountMergePreflight";

describe("runAccountMergePreflight", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runAccountMergePreflight({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});
