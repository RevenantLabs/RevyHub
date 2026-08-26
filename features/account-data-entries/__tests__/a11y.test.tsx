import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AccountDataEntriesPanel } from "@/features/account-data-entries/components/AccountDataEntriesPanel";

describe("AccountDataEntriesPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AccountDataEntriesPanel />);
    await expectNoAxeViolations(container);
  });
});
