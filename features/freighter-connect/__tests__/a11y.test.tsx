import { afterEach, describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { FreighterConnectPanel } from "@/features/freighter-connect/components/FreighterConnectPanel";
import { copy } from "@/features/freighter-connect/copy";
import {
  connectedApi,
  mainnetApi
} from "@/features/freighter-connect/fixtures/freighterConnect.fixture";
import type { FreighterApi } from "@/features/freighter-connect/types";

function install(api: FreighterApi | undefined) {
  if (api) {
    (window as unknown as { freighterApi?: FreighterApi }).freighterApi = api;
  } else {
    delete (window as unknown as { freighterApi?: FreighterApi }).freighterApi;
  }
}

afterEach(() => install(undefined));

describe("FreighterConnectPanel accessibility", () => {
  it("has no WCAG A/AA violations when the wallet is absent", async () => {
    install(undefined);
    const { container } = renderFeature(<FreighterConnectPanel />);
    await screen.findByRole("link", { name: copy.installLink });

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a connected wallet", async () => {
    install(connectedApi);
    const { container } = renderFeature(<FreighterConnectPanel />, { network: "testnet" });
    await screen.findByText(copy.detectedTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a network mismatch warning", async () => {
    install(mainnetApi);
    const { container } = renderFeature(<FreighterConnectPanel />, { network: "testnet" });
    await screen.findByText(copy.mismatchTitle);

    await expectNoAxeViolations(container);
  });
});
