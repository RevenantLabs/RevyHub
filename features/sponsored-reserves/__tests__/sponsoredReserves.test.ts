import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { loadSponsoredReserves } from "@/features/sponsored-reserves/lib/sponsoredReserves";
import { handlers } from "@/features/sponsored-reserves/msw/handlers";
import { accountId, sponsorId, sponsoredAccountId } from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";
import { resetHorizonClients } from "@/core/horizon/client";

withMswHandlers(...handlers);

describe("loadSponsoredReserves", () => {
  it("loads sponsored reserves for an account", async () => {
    resetHorizonClients();
    const result = await loadSponsoredReserves({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok");

    expect(result.value.accountId).toBe(accountId);
    
    expect(result.value.sponsoredByOthers).toHaveLength(3);
    expect(result.value.sponsoredByOthers[0].sponsor).toBe(sponsorId);
    
    expect(result.value.sponsoringForOthers).toHaveLength(3);
    expect(result.value.sponsoringForOthers[0].accountSponsored).toBe(sponsoredAccountId);
  });
});
