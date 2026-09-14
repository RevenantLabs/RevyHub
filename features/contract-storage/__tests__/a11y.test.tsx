import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { ContractStoragePanel } from "@/features/contract-storage/components/ContractStoragePanel";
import { copy } from "@/features/contract-storage/copy";
import { handlers } from "@/features/contract-storage/msw/handlers";
import { contractId } from "@/features/contract-storage/fixtures/contractStorage.fixture";

withMswHandlers(...handlers);

describe("ContractStoragePanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ContractStoragePanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a rendered storage table", async () => {
    const { container, user } = renderFeature(<ContractStoragePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), contractId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());

    await expectNoAxeViolations(container);
  });
});
