import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AccountDataEntriesPanel } from "@/features/account-data-entries/components/AccountDataEntriesPanel";
import { copy } from "@/features/account-data-entries/copy";

describe("AccountDataEntriesPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AccountDataEntriesPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<AccountDataEntriesPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
