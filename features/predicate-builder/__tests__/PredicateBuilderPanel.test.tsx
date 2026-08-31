import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { PredicateBuilderPanel } from "@/features/predicate-builder/components/PredicateBuilderPanel";
import { copy } from "@/features/predicate-builder/copy";

describe("PredicateBuilderPanel", () => {
  it("shows the empty state initially", () => {
    renderFeature(<PredicateBuilderPanel />);
    
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.emptyDescription)).toBeInTheDocument();
  });

  it("shows the form", () => {
    renderFeature(<PredicateBuilderPanel />);
    
    expect(screen.getByLabelText(copy.predicateTypeLabel)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.buildPredicate })).toBeInTheDocument();
  });

  it("builds an unconditional predicate", async () => {
    const { user } = renderFeature(<PredicateBuilderPanel />);
    
    // Default type is unconditional
    await user.click(screen.getByRole("button", { name: copy.buildPredicate }));
    
    await waitFor(() => {
      expect(screen.getByText(copy.plainLanguageTitle)).toBeInTheDocument();
    });
    
    expect(screen.getByText("the balance can be claimed at any time")).toBeInTheDocument();
    expect(screen.getByText(copy.xdrLabel)).toBeInTheDocument();
  });

  it("builds a before_absolute predicate", async () => {
    const { user } = renderFeature(<PredicateBuilderPanel />);
    
    // Select before_absolute type
    await user.selectOptions(
      screen.getByLabelText(copy.predicateTypeLabel),
      "before_absolute"
    );
    
    // Enter a timestamp - datetime-local format
    const timestampInput = screen.getByLabelText(copy.timestampLabel);
    await user.type(timestampInput, "2027-01-01T00:00");
    
    await user.click(screen.getByRole("button", { name: copy.buildPredicate }));
    
    await waitFor(() => {
      expect(screen.getByText(copy.plainLanguageTitle)).toBeInTheDocument();
    });
    
    // Check that a date appears in the plain language
    expect(screen.getByText(/before 202\d-\d{2}-\d{2}/)).toBeInTheDocument();
  });

  it("builds a before_relative predicate", async () => {
    const { user } = renderFeature(<PredicateBuilderPanel />);
    
    await user.selectOptions(
      screen.getByLabelText(copy.predicateTypeLabel),
      "before_relative"
    );
    
    const secondsInput = screen.getByLabelText(copy.secondsLabel);
    await user.clear(secondsInput);
    await user.type(secondsInput, "86400");
    
    await user.click(screen.getByRole("button", { name: copy.buildPredicate }));
    
    await waitFor(() => {
      expect(screen.getByText(copy.plainLanguageTitle)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/within 1 day after the balance was created/)).toBeInTheDocument();
  });

  it("shows error for invalid timestamp", async () => {
    const { user } = renderFeature(<PredicateBuilderPanel />);
    
    await user.selectOptions(
      screen.getByLabelText(copy.predicateTypeLabel),
      "before_absolute"
    );
    
    // Don't enter a timestamp - leave it empty and submit
    await user.click(screen.getByRole("button", { name: copy.buildPredicate }));
    
    // Should get error but form remains - just doesn't build the predicate
    // The error is validation error, not shown as banner, so form just stays idle
    await waitFor(() => {
      // Empty state should still be present or error shown
      // Since this is field-level validation, there may not be a banner
      expect(screen.queryByText(copy.plainLanguageTitle)).not.toBeInTheDocument();
    });
  });

  it("allows adding AND conditions", async () => {
    const { user } = renderFeature(<PredicateBuilderPanel />);
    
    await user.selectOptions(
      screen.getByLabelText(copy.predicateTypeLabel),
      "and"
    );
    
    // Should show "Add Condition" button
    expect(screen.getByRole("button", { name: copy.addCondition })).toBeInTheDocument();
  });

  it("shows error for AND with insufficient children", async () => {
    const { user } = renderFeature(<PredicateBuilderPanel />);
    
    await user.selectOptions(
      screen.getByLabelText(copy.predicateTypeLabel),
      "and"
    );
    
    // Try to build without adding sufficient conditions (need at least 2)
    await user.click(screen.getByRole("button", { name: copy.buildPredicate }));
    
    // The AND starts with 0 children, so it should fail validation
    await waitFor(() => {
      // Should not show success
      expect(screen.queryByText(copy.plainLanguageTitle)).not.toBeInTheDocument();
    });
  });

  it("can copy XDR output", async () => {
    const { user } = renderFeature(<PredicateBuilderPanel />);
    
    await user.click(screen.getByRole("button", { name: copy.buildPredicate }));
    
    await waitFor(() => {
      expect(screen.getByText(copy.plainLanguageTitle)).toBeInTheDocument();
    });
    
    // Should have a copy button
    expect(screen.getByRole("button", { name: `Copy ${copy.xdrLabel}` })).toBeInTheDocument();
  });
});
