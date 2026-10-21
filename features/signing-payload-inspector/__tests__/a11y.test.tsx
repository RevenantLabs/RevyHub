import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { SigningPayloadInspectorPanel } from "@/features/signing-payload-inspector/components/SigningPayloadInspectorPanel";
import { copy } from "@/features/signing-payload-inspector/copy";
import { classicXdr } from "@/features/signing-payload-inspector/fixtures/classic-envelope.fixture";

describe("SigningPayloadInspectorPanel accessibility", () => {
  it("has no WCAG 2.1 A/AA violations while idle", async () => {
    const { container } = renderFeature(<SigningPayloadInspectorPanel />);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG 2.1 A/AA violations with a result", async () => {
    const { container, user } = renderFeature(<SigningPayloadInspectorPanel />);
    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(classicXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.classicTitle);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG 2.1 A/AA violations with an error", async () => {
    const { container, user } = renderFeature(<SigningPayloadInspectorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");
    await expectNoAxeViolations(container);
  });
});
