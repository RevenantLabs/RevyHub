import "../mocks.tsx";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import HomePage from "@/app/page";

describe("Dashboard page", () => {
  it("has no axe violations", async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
