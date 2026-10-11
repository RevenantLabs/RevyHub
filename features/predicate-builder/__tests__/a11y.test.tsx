import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { PredicateBuilderPanel } from "@/features/predicate-builder/components/PredicateBuilderPanel";
import { copy } from "@/features/predicate-builder/copy";

describe("PredicateBuilderPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<PredicateBuilderPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a built predicate on screen", async () => {
    const { container, user } = renderFeature(<PredicateBuilderPanel />);
    
    // Build an unconditional predicate
    await user.click(screen.getByRole("button", { name: copy.buildPredicate }));
    
    await waitFor(() => {
      expect(screen.getByText(copy.plainLanguageTitle)).toBeInTheDocument();
    });
    
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with error state", async () => {
    const { container, user } = renderFeature(<PredicateBuilderPanel />);
    
    // Select before_absolute without entering a timestamp
    await user.selectOptions(
      screen.getByLabelText(copy.predicateTypeLabel),
      "before_absolute"
    );
    
    await user.click(screen.getByRole("button", { name: copy.buildPredicate }));
    
    // Wait a moment for any state changes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with nested predicates", async () => {
    const { container, user } = renderFeature(<PredicateBuilderPanel />);
    
    // Build an AND predicate
    await user.selectOptions(
      screen.getByLabelText(copy.predicateTypeLabel),
      "and"
    );
    
    // Add a condition
    await user.click(screen.getByRole("button", { name: copy.addCondition }));
    
    await expectNoAxeViolations(container);
  });
});
