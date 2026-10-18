import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";

export interface RenderFeatureOptions extends Omit<RenderOptions, "wrapper"> {
  network?: StellarNetwork;
}

/**
 * Renders a feature component inside the same providers the real app uses,
 * and returns a bound `userEvent` instance.
 *
 * Every slice's component tests should go through this helper so provider
 * wiring stays identical between the app and the test suite.
 */
export function renderFeature(
  ui: ReactElement,
  { network = "testnet", ...options }: RenderFeatureOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  function Wrapper({ children }: { children: ReactNode }) {
    return <NetworkProvider initialNetwork={network}>{children}</NetworkProvider>;
  }

  const user = userEvent.setup();
  return { ...render(ui, { wrapper: Wrapper, ...options }), user };
}

export * from "@testing-library/react";
export { userEvent };
