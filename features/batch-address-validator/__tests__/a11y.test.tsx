import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { BatchAddressValidatorPanel } from "@/features/batch-address-validator/components/BatchAddressValidatorPanel";
import { copy } from "@/features/batch-address-validator/copy";
import { mixedAddressList } from "@/features/batch-address-validator/fixtures/batchAddressValidator.fixture";

describe("BatchAddressValidatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<BatchAddressValidatorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations once results are shown", async () => {
    const { container, user } = renderFeature(<BatchAddressValidatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), mixedAddressList.join("\n"));
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.summaryTitle);

    await expectNoAxeViolations(container);
  });
});
