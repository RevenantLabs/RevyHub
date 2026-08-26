import { describe, expect, it } from "vitest";
import { runAccountDataEntries } from "@/features/account-data-entries/lib/accountDataEntries";

describe("runAccountDataEntries", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runAccountDataEntries({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});
