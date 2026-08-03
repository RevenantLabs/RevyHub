import type { ImgHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { HomePage } from "../../app/page";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => <div data-testid="mock-image" aria-label={alt} {...props} />
}));

describe("HomePage workflow filters", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("filters tools by workflow without reloading the page", () => {
    act(() => {
      root.render(<HomePage />);
    });

    const select = container.querySelector('select[name="workflow-filter"]') as HTMLSelectElement;
    expect(select).toBeTruthy();

    act(() => {
      select.value = "Payments";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(container.textContent).toContain("Payment QR Generator");
    expect(container.textContent).not.toContain("Address Validator");
  });
});
