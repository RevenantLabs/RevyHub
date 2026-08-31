import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { TomlValidatorPanel } from "@/features/toml-validator/components/TomlValidatorPanel";
import { copy } from "@/features/toml-validator/copy";

describe("TomlValidatorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<TomlValidatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<TomlValidatorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
