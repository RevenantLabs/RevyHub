// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("@/components/stellar/RedactionProvider", () => ({
  useRedaction: vi.fn(),
}));

import { CopyableValue } from "@/components/stellar/CopyableValue";
import { useRedaction } from "@/components/stellar/RedactionProvider";

function mockRedaction(redacted: boolean) {
  vi.mocked(useRedaction).mockReturnValue({ redacted, setRedacted: vi.fn() });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/* ------------------------------------------------------------------ */
/*  CopyableValue redaction behaviour                                  */
/* ------------------------------------------------------------------ */

describe("CopyableValue — redaction behaviour", () => {
  const stellarKey =
    "GCXKG6RN4ON6YJWUCYG6J6Y6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6";

  it("renders a masked value with disabled copy and accessible label when redacted", () => {
    mockRedaction(true);
    render(<CopyableValue label="source account" value={stellarKey} />);

    // The display should contain the masked pattern
    const displayed = screen.getByText(/G••••••••/);
    expect(displayed).toBeInTheDocument();

    // The copy button should be disabled and show "Locked"
    const copyButton = screen.getByRole("button");
    expect(copyButton).toBeDisabled();
    expect(copyButton).toHaveTextContent("Locked");

    // The span should have a redacted aria-label
    const valueSpan = screen.getByLabelText("Redacted source account");
    expect(valueSpan).toBeInTheDocument();

    // The copy button should have a descriptive aria-label
    expect(copyButton).toHaveAttribute(
      "aria-label",
      "Copy disabled while privacy mode is active"
    );
  });

  it("renders a normal truncated value with enabled copy when not redacted", () => {
    mockRedaction(false);
    render(<CopyableValue label="source account" value={stellarKey} />);

    // The display should contain the truncated middle pattern
    const displayed = screen.getByText(/GCXKG6\.\.\./);
    expect(displayed).toBeInTheDocument();

    // The copy button should be enabled and show "Copy"
    const copyButton = screen.getByRole("button");
    expect(copyButton).not.toBeDisabled();
    expect(copyButton).toHaveTextContent("Copy");
  });
});
