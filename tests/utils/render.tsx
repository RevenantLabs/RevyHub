import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NetworkProvider } from "@/components/stellar/NetworkProvider";

export function renderWithNetwork(ui: ReactElement) {
  return render(ui, { wrapper: NetworkProvider });
}
