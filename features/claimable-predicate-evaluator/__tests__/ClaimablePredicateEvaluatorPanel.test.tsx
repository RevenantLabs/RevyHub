import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { ClaimablePredicateEvaluatorPanel } from "@/features/claimable-predicate-evaluator/components/ClaimablePredicateEvaluatorPanel";
import { copy, errorCopy } from "@/features/claimable-predicate-evaluator/copy";
import { claimantA, balanceJson, deadline } from "@/features/claimable-predicate-evaluator/fixtures/normal.fixture";
import { relativeBalance, malformedUnion } from "@/features/claimable-predicate-evaluator/fixtures/boundary.fixture";
async function fill(user: ReturnType<typeof renderFeature>["user"], text: string) {
  await user.click(screen.getByLabelText(copy.text)); await user.paste(text);
  await user.type(screen.getByLabelText(copy.claimant), claimantA);
  await user.type(screen.getByLabelText(copy.evaluation), deadline);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}
describe("evaluator panel", () => {
  it("shows initial, complete, and incomplete evidence", async () => {
    const { user } = renderFeature(<ClaimablePredicateEvaluatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await fill(user, balanceJson); expect(await screen.findByText(copy.evidenceComplete)).toBeInTheDocument();
    await user.clear(screen.getByLabelText(copy.text));
    await user.click(screen.getByLabelText(copy.text)); await user.paste(relativeBalance);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.missingCreation)).toBeInTheDocument();
    expect(screen.getByText(`${claimantA}: Unknown`)).toBeInTheDocument();
  });
  it("shows malformed data without rendering the pasted secret", async () => {
    const { user } = renderFeature(<ClaimablePredicateEvaluatorPanel />);
    await fill(user, malformedUnion);
    expect(await screen.findByText(errorCopy.malformed_data.title)).toBeInTheDocument();
    const seed = "S" + "A".repeat(55);
    await user.clear(screen.getByLabelText(copy.claimant)); await user.type(screen.getByLabelText(copy.claimant), seed);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(seed);
  });
  it("clears a seed-like token pasted into the data field", async () => {
    const { user } = renderFeature(<ClaimablePredicateEvaluatorPanel />);
    await user.click(screen.getByLabelText(copy.text));
    await user.paste('"SABC"');
    await user.type(screen.getByLabelText(copy.claimant), claimantA);
    await user.type(screen.getByLabelText(copy.evaluation), deadline);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.text)).toHaveValue("");
  });
});
