import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FieldError } from "../../components/ui/FieldError";

afterEach(cleanup);

describe("FieldError", () => {
  it("renders the error message", () => {
    render(<FieldError id="field-error" message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders nothing when message is empty", () => {
    const { container } = render(<FieldError id="field-error" message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when message is null", () => {
    const { container } = render(<FieldError id="field-error" message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when message is undefined", () => {
    const { container } = render(<FieldError id="field-error" />);
    expect(container.firstChild).toBeNull();
  });

  it("has the correct id and role attributes", () => {
    render(<FieldError id="addr-error" message="Invalid address" />);
    const element = screen.getByRole("alert");
    expect(element).toHaveAttribute("id", "addr-error");
    expect(element).toHaveTextContent("Invalid address");
  });
});
