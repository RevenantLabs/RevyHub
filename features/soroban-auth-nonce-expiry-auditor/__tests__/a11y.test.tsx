import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { SorobanAuthNonceExpiryAuditorPanel } from "../components/SorobanAuthNonceExpiryAuditorPanel";
import { copy } from "../copy";
import { addressEntry } from "../fixtures/normal.fixture";
import { Networks } from "@stellar/stellar-sdk";
describe("audit accessibility", () => {
  it("has no WCAG A/AA violations initially", async () => { const {container} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>); await expectNoAxeViolations(container); });
  it("has no WCAG A/AA violations with results", async () => {
    const {container, user} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>);
    await user.click(screen.getByLabelText(copy.bundleLabel)); await user.paste(addressEntry());
    await user.selectOptions(screen.getByLabelText(copy.networkLabel), Networks.TESTNET);
    await user.click(screen.getByLabelText(copy.ledgerLabel)); await user.type(screen.getByLabelText(copy.ledgerLabel), "100");
    await user.click(screen.getByRole("button", {name: copy.submit}));
    await screen.findByText(copy.rowsTitle);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG A/AA violations on error", async () => {
    const {container, user} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>);
    await user.click(screen.getByRole("button", {name: copy.submit}));
    await screen.findByRole("alert");
    await expectNoAxeViolations(container);
  });
});
