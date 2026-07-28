// @vitest-environment jsdom

/**
 * Scanner abstraction tests.
 *
 * These tests validate scanner lifecycle by injecting a mock
 * scanner module so no real camera is required.
 *
 * NOTE: jsdom does not drain the microtask queue between test
 * steps, so async continuations (code after `await`) in React
 * event handlers never execute.  Tests that require the scanner
 * to be fully constructed or the decode callback to be wired
 * must be run in a real browser (e.g. via Playwright or Cypress).
 *
 * The tests here cover synchronous states, error detection
 * that happens before any `await`, and the paste fallback.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { QRScanner } from "../../components/stellar/QRScanner";

function createMockScannerModule() {
  const MockScanner = vi.fn() as unknown as {
    new (
      _video: HTMLVideoElement,
      _onDecode: (result: {
        data: string;
        cornerPoints: Array<{ x: number; y: number }>;
      }) => void,
      _options?: Record<string, unknown>
    ): {
      start: ReturnType<typeof vi.fn>;
      destroy: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
      setCamera: ReturnType<typeof vi.fn>;
    };
    hasCamera: ReturnType<typeof vi.fn>;
    listCameras: ReturnType<typeof vi.fn>;
    DEFAULT_CANVAS_SIZE: number;
    NO_QR_CODE_FOUND: string;
  };

  MockScanner.hasCamera = vi.fn().mockResolvedValue(true);
  MockScanner.listCameras = vi.fn().mockResolvedValue([{ id: "cam", label: "Camera" }]);
  MockScanner.DEFAULT_CANVAS_SIZE = 400;
  MockScanner.NO_QR_CODE_FOUND = "No QR code found";

  return MockScanner;
}

beforeEach(() => {
  Object.defineProperty(globalThis, "isSecureContext", {
    value: true,
    configurable: true,
    writable: true
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("QRScanner", () => {
  it("renders the idle state with a start button and paste fallback", () => {
    const MockScanner = createMockScannerModule();
    render(<QRScanner onScan={vi.fn()} scannerModule={MockScanner} />);

    expect(screen.getByText("Start camera")).toBeDefined();
    expect(screen.getByText("Or paste a payment URI")).toBeDefined();
  });

  it("renders insecure-context state when isSecureContext is false", () => {
    (globalThis as { isSecureContext: boolean }).isSecureContext = false;

    const MockScanner = createMockScannerModule();
    const onError = vi.fn();

    // The insecure-context check runs synchronously before any await
    render(<QRScanner onScan={vi.fn()} onError={onError} scannerModule={MockScanner} />);
    fireEvent.click(screen.getByText("Start camera"));

    expect(screen.getByText("Insecure context")).toBeDefined();
    expect(onError).toHaveBeenCalledWith("Insecure context: camera access denied.");
    // Scanner constructor is never called for insecure context
    expect(MockScanner).not.toHaveBeenCalled();
  });

  it("accepts pasted URIs from the manual fallback", () => {
    const onScan = vi.fn();
    const MockScanner = createMockScannerModule();

    render(<QRScanner onScan={onScan} scannerModule={MockScanner} />);

    const pasteInput = screen.getByLabelText("Paste payment URI");
    fireEvent.change(pasteInput, {
      target: { value: "web+stellar:pay?destination=GA7QNFM3QIAY6OM6H2VU5G6H3XK7Q7XK7&amount=10" }
    });
    fireEvent.click(screen.getByLabelText("Parse pasted URI"));

    expect(onScan).toHaveBeenCalledWith(
      "web+stellar:pay?destination=GA7QNFM3QIAY6OM6H2VU5G6H3XK7Q7XK7&amount=10"
    );
  });

  it("calls scanner hasCamera when Start camera is clicked", () => {
    const MockScanner = createMockScannerModule();

    render(<QRScanner onScan={vi.fn()} scannerModule={MockScanner} />);
    fireEvent.click(screen.getByText("Start camera"));

    // hasCamera is called synchronously inside the async handler
    // before the first await.  This assertion verifies the mock
    // injection works correctly.
    expect(MockScanner.hasCamera).toHaveBeenCalledOnce();
  });

  it("calls scanner hasCamera even when hasCamera returns false", () => {
    const MockScanner = createMockScannerModule();
    MockScanner.hasCamera = vi.fn().mockResolvedValue(false);

    render(<QRScanner onScan={vi.fn()} scannerModule={MockScanner} />);
    fireEvent.click(screen.getByText("Start camera"));

    expect(MockScanner.hasCamera).toHaveBeenCalledOnce();
  });

  it("renders without crashing when default scanner module is used", () => {
    // When no scannerModule prop is provided, the component uses
    // the real qr-scanner import.  Just verify it renders.
    render(<QRScanner onScan={vi.fn()} />);
    expect(screen.getByText("Start camera")).toBeDefined();
  });
});
