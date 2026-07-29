// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import { axe } from "../utils/axe";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt as string} {...props} />;
  }
}));

describe("Dashboard a11y", () => {
  it("has no serious or critical axe violations", async () => {
    const { container } = render(<HomePage />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
