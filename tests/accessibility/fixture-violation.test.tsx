import "../mocks.tsx";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";

function ViolatingComponent() {
  return (
    <div>
      <h1>Missing alt text</h1>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- Intentionally missing alt text to prove axe violation detection */}
      <img src="https://example.com/image.png" />
    </div>
  );
}

describe("Fixture: axe violation detection", () => {
  it("detects an intentionally introduced violation (missing image alt text)", async () => {
    const { container } = render(<ViolatingComponent />);
    const results = await axe(container);
    expect(results.violations.length).toBeGreaterThan(0);
    const violationIds = results.violations.map((v) => v.id);
    expect(violationIds).toContain("image-alt");
  });
});
