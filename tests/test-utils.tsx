import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { RedactionProvider } from "@/components/stellar/RedactionProvider";

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return <RedactionProvider>{children}</RedactionProvider>;
};

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
