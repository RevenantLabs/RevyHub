import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { ManageDataCodecPanel } from "@/features/manage-data-codec/components/ManageDataCodecPanel";
import { copy } from "@/features/manage-data-codec/copy";
import {
  multibyteNameOverLimit,
  simpleName,
  simpleValue
} from "@/features/manage-data-codec/fixtures/manageDataCodec.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function fill(user: User, field: string, text: string) {
  await user.click(screen.getByLabelText(field));
  await user.paste(text);
}

describe("ManageDataCodecPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ManageDataCodecPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with an encoded entry on screen", async () => {
    const { container, user } = renderFeature(<ManageDataCodecPanel />);

    await fill(user, copy.nameLabel, simpleName);
    await fill(user, copy.valueLabel, simpleValue);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.operationTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in delete mode", async () => {
    const { container, user } = renderFeature(<ManageDataCodecPanel />);

    await user.selectOptions(screen.getByLabelText(copy.modeLabel), "delete");
    await fill(user, copy.nameLabel, simpleName);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.deleteTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<ManageDataCodecPanel />);

    await fill(user, copy.nameLabel, multibyteNameOverLimit);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
