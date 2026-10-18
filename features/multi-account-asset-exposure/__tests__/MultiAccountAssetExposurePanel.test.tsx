import { describe, expect, it } from "vitest";
import { fireEvent, renderFeature, screen, within } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { MultiAccountAssetExposurePanel } from "../components/MultiAccountAssetExposurePanel";
import { copy, errorCopy } from "../copy";
import { accountA, accountB, accountC, issuerA, issuerB } from "../fixtures/multiAccountAssetExposure.fixture";
import { handlers } from "../msw/handlers";
withMswHandlers(...handlers);
describe("exposure panel", () => {
  it("shows guidance, then both issuers and exact totals", async () => {
    const { user } = renderFeature(<MultiAccountAssetExposurePanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await user.type(screen.getByLabelText(copy.formLabel), `${accountA}\n${accountB}`);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    const table = await screen.findByRole("table");
    expect(within(table).getAllByRole("rowheader", { name: "USD" })).toHaveLength(2);
    expect(within(table).getByText(issuerA)).toBeInTheDocument();
    expect(within(table).getByText(issuerB)).toBeInTheDocument();
    expect(within(table).getByText("922,337,203,685.4775808")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.export })).toBeInTheDocument();
  });
  it("keeps successful data visible beside a missing account", async () => {
    const { user } = renderFeature(<MultiAccountAssetExposurePanel />);
    await user.type(screen.getByLabelText(copy.formLabel), `${accountA}\n${accountC}`);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText(copy.partialNotice)).toBeInTheDocument();
  });
  it("rejects a pasted seed immediately without echoing it", async () => {
    const { container } = renderFeature(<MultiAccountAssetExposurePanel />);
    fireEvent.change(screen.getByLabelText(copy.formLabel), { target: { value: "SNOTASEED" } });
    expect(await screen.findByText(errorCopy.invalid_account.title)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.formLabel)).toHaveValue("");
    expect(container.textContent).not.toContain("SNOTASEED");
  });
});
