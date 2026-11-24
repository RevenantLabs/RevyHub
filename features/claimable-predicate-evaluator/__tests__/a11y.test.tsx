import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { ClaimablePredicateEvaluatorPanel } from "@/features/claimable-predicate-evaluator/components/ClaimablePredicateEvaluatorPanel";
import { copy, errorCopy } from "@/features/claimable-predicate-evaluator/copy";
import { claimantA, balanceJson, deadline } from "@/features/claimable-predicate-evaluator/fixtures/normal.fixture";
import { relativeBalance } from "@/features/claimable-predicate-evaluator/fixtures/boundary.fixture";
describe("evaluator accessibility", () => {
  it("passes WCAG A/AA in initial, result, and error states", async () => {
    const { container, user } = renderFeature(<ClaimablePredicateEvaluatorPanel />);
    await expectNoAxeViolations(container);
    await user.click(screen.getByLabelText(copy.text)); await user.paste(balanceJson);
    await user.type(screen.getByLabelText(copy.claimant), claimantA);
    await user.type(screen.getByLabelText(copy.evaluation), deadline);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.evidenceComplete);
    await expectNoAxeViolations(container);
    await user.clear(screen.getByLabelText(copy.text));
    await user.click(screen.getByLabelText(copy.text)); await user.paste(relativeBalance);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.missingCreation);
    await expectNoAxeViolations(container);
    await user.clear(screen.getByLabelText(copy.text)); await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(errorCopy.invalid_input.title);
    await expectNoAxeViolations(container);
  }, 15_000);
});
