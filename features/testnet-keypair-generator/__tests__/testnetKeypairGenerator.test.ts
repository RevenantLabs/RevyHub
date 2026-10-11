import { describe, expect, it } from "vitest";
import { runTestnetKeypairGenerator } from "@/features/testnet-keypair-generator/lib/testnetKeypairGenerator";

describe("runTestnetKeypairGenerator", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runTestnetKeypairGenerator({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});
