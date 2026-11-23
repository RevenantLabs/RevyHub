import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { FeeBumpReplacementComparatorPanel } from "@/features/fee-bump-replacement-comparator/components/FeeBumpReplacementComparatorPanel";
import { copy } from "@/features/fee-bump-replacement-comparator/copy";
import {
  currentFeeBumpXdr,
  higherFeeBumpXdr
} from "@/features/fee-bump-replacement-comparator/fixtures/normal.fixture";
import {
  changedInnerSourceXdr,
  ordinaryXdr
} from "@/features/fee-bump-replacement-comparator/fixtures/boundary.fixture";

describe("FeeBumpReplacementComparatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<FeeBumpReplacementComparatorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a successful comparison on screen", async () => {
    const { container, user } = renderFeature(<FeeBumpReplacementComparatorPanel />);

    await user.click(screen.getByLabelText(copy.leftLabel));
    await user.paste(currentFeeBumpXdr);
    await user.click(screen.getByLabelText(copy.rightLabel));
    await user.paste(higherFeeBumpXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.equivalentTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in the incomplete-evidence state", async () => {
    const { container, user } = renderFeature(<FeeBumpReplacementComparatorPanel />);

    await user.click(screen.getByLabelText(copy.leftLabel));
    await user.paste(currentFeeBumpXdr);
    await user.click(screen.getByLabelText(copy.rightLabel));
    await user.paste(changedInnerSourceXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.incompleteEvidenceTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing the wrong-envelope notice", async () => {
    const { container, user } = renderFeature(<FeeBumpReplacementComparatorPanel />);

    await user.click(screen.getByLabelText(copy.leftLabel));
    await user.paste(currentFeeBumpXdr);
    await user.click(screen.getByLabelText(copy.rightLabel));
    await user.paste(ordinaryXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("status");

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with the custom passphrase field revealed", async () => {
    const { container, user } = renderFeature(<FeeBumpReplacementComparatorPanel />);

    await user.selectOptions(screen.getByLabelText(copy.networkLabel), "custom");
    await screen.findByLabelText(copy.customNetworkLabel);

    await expectNoAxeViolations(container);
  });
});
