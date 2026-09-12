import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { Sep12FieldsPanel } from "@/features/sep12-fields/components/Sep12FieldsPanel";
import { copy, errorCopy } from "@/features/sep12-fields/copy";
import { MAX_QUERY_LENGTH } from "@/features/sep12-fields/schema";

async function search(user: ReturnType<typeof renderFeature>["user"], value: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  if (value) await user.paste(value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("Sep12FieldsPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<Sep12FieldsPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with results on screen", async () => {
    const { container, user } = renderFeature(<Sep12FieldsPanel />);
    await search(user, "address_country_code");
    await screen.findByText(copy.resultsTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations when nothing matches", async () => {
    const { container, user } = renderFeature(<Sep12FieldsPanel />);
    await search(user, "zzzz-definitely-not-a-field");
    await screen.findByText(copy.noMatchesTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in its error state", async () => {
    const { container, user } = renderFeature(<Sep12FieldsPanel />);
    await search(user, "x".repeat(MAX_QUERY_LENGTH + 1));
    await screen.findByText(errorCopy.query_too_long.title);

    await expectNoAxeViolations(container);
  });
});
