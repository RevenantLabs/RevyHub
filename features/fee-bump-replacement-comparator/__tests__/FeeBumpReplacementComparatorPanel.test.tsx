import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { FeeBumpReplacementComparatorPanel } from "@/features/fee-bump-replacement-comparator/components/FeeBumpReplacementComparatorPanel";
import { copy, errorCopy } from "@/features/fee-bump-replacement-comparator/copy";
import {
  currentFeeBumpXdr,
  higherFeeBumpXdr
} from "@/features/fee-bump-replacement-comparator/fixtures/normal.fixture";
import {
  changedInnerSourceXdr,
  lowerFeeBumpXdr,
  notBase64,
  ordinaryXdr,
  secretSeed
} from "@/features/fee-bump-replacement-comparator/fixtures/boundary.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function compare(user: User, left: string, right: string) {
  await user.click(screen.getByLabelText(copy.leftLabel));
  await user.paste(left);
  await user.click(screen.getByLabelText(copy.rightLabel));
  await user.paste(right);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("FeeBumpReplacementComparatorPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<FeeBumpReplacementComparatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders a successful replacement comparison with both sections", async () => {
    const { user } = renderFeature(<FeeBumpReplacementComparatorPanel />);
    await compare(user, currentFeeBumpXdr, higherFeeBumpXdr);

    expect(await screen.findByText(copy.equivalentTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.outerFeeTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.feeIncreasedNote)).toBeInTheDocument();
  });

  it("labels each inner-hash copy action distinctly", async () => {
    const { user } = renderFeature(<FeeBumpReplacementComparatorPanel />);
    await compare(user, currentFeeBumpXdr, higherFeeBumpXdr);

    expect(
      await screen.findByRole("button", { name: "Copy current inner hash" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy replacement inner hash" })
    ).toBeInTheDocument();
  });

  it("shows incomplete evidence when the inner source differs", async () => {
    const { user } = renderFeature(<FeeBumpReplacementComparatorPanel />);
    await compare(user, currentFeeBumpXdr, changedInnerSourceXdr);

    expect(await screen.findByText(copy.incompleteEvidenceTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.incompleteEvidenceDescription)).toBeInTheDocument();
    expect(screen.getByText(copy.refusedDescription)).toBeInTheDocument();
  });

  it("explains a lower outer fee without claiming acceptance", async () => {
    const { user } = renderFeature(<FeeBumpReplacementComparatorPanel />);
    await compare(user, currentFeeBumpXdr, lowerFeeBumpXdr);

    expect(await screen.findByText(copy.feeDecreasedNote)).toBeInTheDocument();
    expect(screen.getByText(copy.equivalentTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.noSubmitNote)).toBeInTheDocument();
  });

  it("treats an ordinary envelope as a wrong-tool notice, not an error", async () => {
    const { user } = renderFeature(<FeeBumpReplacementComparatorPanel />);
    await compare(user, currentFeeBumpXdr, ordinaryXdr);

    const notice = await screen.findByText(errorCopy.unsupported_variant.title);
    expect(notice).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(errorCopy.unsupported_variant.title);
  });

  it("explains a bad paste differently from a bad envelope", async () => {
    const { user } = renderFeature(<FeeBumpReplacementComparatorPanel />);
    await compare(user, notBase64, higherFeeBumpXdr);

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("refuses a pasted secret key and clears it out of the field", async () => {
    const { user } = renderFeature(<FeeBumpReplacementComparatorPanel />);
    await compare(user, secretSeed, higherFeeBumpXdr);

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(secretSeed)).not.toBeInTheDocument();
    expect(screen.queryByText(secretSeed)).not.toBeInTheDocument();
  });
});
