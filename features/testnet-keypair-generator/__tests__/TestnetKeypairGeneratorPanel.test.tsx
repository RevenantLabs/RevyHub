import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { TestnetKeypairGeneratorPanel } from "@/features/testnet-keypair-generator/components/TestnetKeypairGeneratorPanel";
import { copy } from "@/features/testnet-keypair-generator/copy";
import { handlers } from "@/features/testnet-keypair-generator/msw/handlers";

withMswHandlers(...handlers);

describe("TestnetKeypairGeneratorPanel", () => {
  it("renders empty state before generating", () => {
    renderFeature(<TestnetKeypairGeneratorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("generates and displays a keypair on submission", async () => {
    const { user } = renderFeature(<TestnetKeypairGeneratorPanel />);

    const submitBtn = screen.getByRole("button", { name: copy.submit });
    await user.click(submitBtn);

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.securityAlertTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.revealSecret)).toBeInTheDocument();
  });

  it("reveals and hides secret key on button toggle", async () => {
    const { user } = renderFeature(<TestnetKeypairGeneratorPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));
    const revealBtn = await screen.findByRole("button", { name: copy.revealSecret });

    await user.click(revealBtn);
    expect(screen.getByRole("button", { name: copy.hideSecret })).toBeInTheDocument();

    const hideBtn = screen.getByRole("button", { name: copy.hideSecret });
    await user.click(hideBtn);
    expect(screen.getByRole("button", { name: copy.revealSecret })).toBeInTheDocument();
  });

  it("shows error alert if secret key input is entered in form", async () => {
    const { user } = renderFeature(<TestnetKeypairGeneratorPanel />);

    const input = screen.getByLabelText(copy.formLabel);
    await user.type(input, "SBZ2O7LMWTY3X3T32SZZK52F4E7U6W23EOGQOES52Z5H7R774H7NVRN2");

    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
