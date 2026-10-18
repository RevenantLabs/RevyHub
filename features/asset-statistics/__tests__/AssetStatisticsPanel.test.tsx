import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { AssetStatisticsPanel } from "@/features/asset-statistics/components/AssetStatisticsPanel";
import { copy, errorCopy, flagCopy } from "@/features/asset-statistics/copy";
import { handlers } from "@/features/asset-statistics/msw/handlers";
import {
  assetCode,
  issuerId,
  secretSeed,
  unknownAssetCode
} from "@/features/asset-statistics/fixtures/assetStatistics.fixture";

withMswHandlers(...handlers);

async function submitAsset(
  user: ReturnType<typeof renderFeature>["user"],
  code = assetCode,
  issuer = issuerId
) {
  await user.type(screen.getByLabelText(copy.assetCodeLabel), code);
  await user.type(screen.getByLabelText(copy.issuerLabel), issuer);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("AssetStatisticsPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AssetStatisticsPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("marks the field that fails validation", async () => {
    const { user } = renderFeature(<AssetStatisticsPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.empty_asset_code.title)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.assetCodeLabel)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("shows supply portions and the authorization breakdown at full precision", async () => {
    const { user } = renderFeature(<AssetStatisticsPanel />);
    await submitAsset(user);

    expect(await screen.findByText("9,007,199,254,741,176.0000000")).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: copy.authorizedLabel })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: copy.liabilitiesOnlyLabel })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: copy.unauthorizedLabel })).toBeInTheDocument();
    expect(screen.getByText(copy.claimableBalancesLabel(4))).toBeInTheDocument();
    expect(screen.getByText(copy.liquidityPoolsLabel(2))).toBeInTheDocument();
  });

  it("lists all issuer flags with a one-line meaning", async () => {
    const { user } = renderFeature(<AssetStatisticsPanel />);
    await submitAsset(user);
    await screen.findByText(copy.flagsTitle);

    for (const flag of Object.values(flagCopy)) {
      expect(screen.getByRole("rowheader", { name: flag.label })).toBeInTheDocument();
      expect(screen.getByText(flag.meaning)).toBeInTheDocument();
    }
  });

  it("names an unknown asset instead of showing a generic error", async () => {
    const { user } = renderFeature(<AssetStatisticsPanel />);
    await submitAsset(user, unknownAssetCode);

    expect(await screen.findByText(errorCopy.asset_not_found.title)).toBeInTheDocument();
  });

  it("clears and never echoes a submitted secret seed", async () => {
    const { container, user } = renderFeature(<AssetStatisticsPanel />);
    await submitAsset(user, assetCode, secretSeed);

    expect(await screen.findByText(errorCopy.invalid_issuer.title)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.issuerLabel)).toHaveValue("");
    expect(container.textContent).not.toContain(secretSeed);
  });
});
