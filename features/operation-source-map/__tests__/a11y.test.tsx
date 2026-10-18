import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { OperationSourceMapPanel } from "@/features/operation-source-map/components/OperationSourceMapPanel";
import { copy } from "@/features/operation-source-map/copy";
import {
  mixedOverridesXdr,
  noOverridesXdr,
  notBase64
} from "@/features/operation-source-map/fixtures/operationSourceMap.fixture";

async function mapEnvelope(user: ReturnType<typeof renderFeature>["user"], envelope: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  await user.paste(envelope);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("OperationSourceMapPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<OperationSourceMapPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a map on screen", async () => {
    const { container, user } = renderFeature(<OperationSourceMapPanel />);

    await mapEnvelope(user, mixedOverridesXdr);
    await screen.findByText(copy.operationsTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in the no-match state", async () => {
    const { container, user } = renderFeature(<OperationSourceMapPanel />);

    await mapEnvelope(user, noOverridesXdr);
    await user.selectOptions(await screen.findByLabelText(copy.filterLabel), "overridden");
    await screen.findByText(copy.noMatchTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<OperationSourceMapPanel />);

    await mapEnvelope(user, notBase64);
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
