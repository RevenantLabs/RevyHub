import { describe, expect, it } from "vitest";
import { runNetworkPassphraseInspector } from "@/features/network-passphrase-inspector/lib/networkPassphraseInspector";

describe("runNetworkPassphraseInspector", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runNetworkPassphraseInspector({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});
