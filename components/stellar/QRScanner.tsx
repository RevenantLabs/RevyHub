"use client";

import { Scan, Camera, CameraOff, SwitchCamera, ClipboardPaste, X, AlertTriangle, ShieldOff, Smartphone, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, useCallback, useId } from "react";
import QrScannerType from "qr-scanner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";

type ScannerState =
  | "idle"
  | "requesting"
  | "scanning"
  | "stopped"
  | "no-camera"
  | "permission-denied"
  | "insecure-context"
  | "error";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  /**
   * Scanner implementation to use. Defaults to the real `qr-scanner` package.
   * Inject a mock in tests to avoid requiring a real camera.
   */
  scannerModule?: typeof QrScannerType;
}

const DECODE_TIMEOUT_MS = 15_000;

const stateIcons = {
  idle: Scan,
  requesting: Camera,
  scanning: Camera,
  stopped: CameraOff,
  "no-camera": Smartphone,
  "permission-denied": AlertTriangle,
  "insecure-context": ShieldOff,
  error: AlertTriangle
} as const;

export function QRScanner({ onScan, onError, scannerModule: Scanner = QrScannerType }: QRScannerProps) {
  const [state, setState] = useState<ScannerState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cameras, setCameras] = useState<QrScannerType.Camera[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState("");
  const [noQrFound, setNoQrFound] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScannerType | null>(null);
  const isMountedRef = useRef(true);
  const gotResultRef = useRef(false);
  const decodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingId = useId();

  const stopScanner = useCallback(() => {
    if (decodeTimerRef.current) {
      clearTimeout(decodeTimerRef.current);
    }
    decodeTimerRef.current = null;
    try {
      scannerRef.current?.destroy();
    } catch {
      // cleanup errors are non-fatal
    }
    scannerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [stopScanner]);

  async function handleStartScan() {
    if (state === "scanning") return;
    gotResultRef.current = false;
    setNoQrFound(false);

    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setState("insecure-context");
      setErrorMessage("Camera access requires a secure HTTPS connection or localhost.");
      onError?.("Insecure context: camera access denied.");
      return;
    }

    setState("requesting");
    setErrorMessage("");

    try {
      const Qr = Scanner;
      const hasCamera = await Qr.hasCamera();
      if (!isMountedRef.current) return;

      if (!hasCamera) {
        setState("no-camera");
        setErrorMessage("No camera found on this device. You can paste a payment URI below instead.");
        onError?.("No camera available.");
        return;
      }

      const availableCameras = await Qr.listCameras(true);
      if (!isMountedRef.current) return;

      setCameras(availableCameras);

      if (!videoRef.current) return;

      const preferredCamera = activeCameraId
        ?? availableCameras.find((c) =>
          c.label.toLowerCase().includes("back") || c.label.toLowerCase().includes("environment")
        )?.id
        ?? "environment";

      const scanner = new Qr(
        videoRef.current,
        (result) => {
          // Guard: ignore if we already processed a result
          if (gotResultRef.current) return;
          gotResultRef.current = true;

          onScan(result.data);
          stopScanner();
          if (isMountedRef.current) {
            setState("stopped");
          }
        },
        {
          preferredCamera,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true
        }
      );

      scannerRef.current = scanner;
      await scanner.start();

      if (isMountedRef.current) {
        setState("scanning");

        // Show a hint if no QR is found after a while
        decodeTimerRef.current = setTimeout(() => {
          if (isMountedRef.current && gotResultRef.current === false) {
            setNoQrFound(true);
          }
        }, DECODE_TIMEOUT_MS);
      }
    } catch (error) {
      if (!isMountedRef.current) return;

      const err = error as Error;

      if (err.name === "NotAllowedError" || /permission/i.test(err.message)) {
        setState("permission-denied");
        setErrorMessage("Camera permission denied. Allow camera access in your browser settings, then try again.");
        onError?.("Camera permission denied.");
      } else if (err.name === "NotFoundError") {
        setState("no-camera");
        setErrorMessage("No camera found on this device. You can paste a payment URI below instead.");
        onError?.("No camera available.");
      } else {
        setState("error");
        setErrorMessage(err.message || "An unexpected error occurred while starting the camera.");
        onError?.(err.message || "Unknown camera error.");
      }
    }
  }

  function handleStopScan() {
    gotResultRef.current = true; // prevent any in-flight decode from re-triggering
    stopScanner();
    if (isMountedRef.current) {
      setState("stopped");
    }
  }

  async function handleCameraChange(deviceId: string) {
    setActiveCameraId(deviceId);
    if (scannerRef.current) {
      try {
        await scannerRef.current.setCamera(deviceId);
      } catch {
        // Camera switch errors are non-fatal
      }
    }
  }

  function handleReset() {
    gotResultRef.current = false;
    setNoQrFound(false);
    stopScanner();
    setState("idle");
    setErrorMessage("");
    setPasteValue("");
  }

  function handlePasteSubmit() {
    const trimmed = pasteValue.trim();
    if (trimmed) {
      onScan(trimmed);
      setState("stopped");
    }
  }

  const StateIcon = stateIcons[state];

  return (
    <div className="space-y-3" role="region" aria-labelledby={headingId}>
      <span id={headingId} className="sr-only">QR code scanner</span>

      {/* Camera scanner area */}
      <Card className="overflow-hidden p-0">
        {state === "idle" || state === "stopped" ? (
          <div className="flex flex-col items-center justify-center gap-4 px-5 py-8">
            <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-[#82cbe3]/70 bg-[#e0f6ff]/60 text-[#47a8c7]">
              <StateIcon className="h-6 w-6" aria-hidden />
            </span>
            <p className="text-center text-sm text-[#5d6b82]">
              {state === "stopped"
                ? "Camera stopped. Start again to scan another QR code."
                : "Point your camera at a Stellar payment QR code."}
            </p>
            <Button type="button" variant="secondary" onClick={handleStartScan}>
              <Camera className="h-4 w-4" aria-hidden />
              {state === "stopped" ? "Scan another" : "Start camera"}
            </Button>
          </div>
        ) : state === "requesting" ? (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-10">
            <Camera className="h-8 w-8 animate-pulse text-[#47a8c7]" aria-hidden />
            <p className="text-sm text-[#5d6b82]">Requesting camera access…</p>
          </div>
        ) : state === "scanning" ? (
          <div className="relative">
            <video
              ref={videoRef}
              className="block h-64 w-full bg-black object-cover"
              muted
              playsInline
            />
            {/* Scan overlay indicator */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
            </div>
            {/* No QR found hint */}
            {noQrFound ? (
              <div className="absolute left-0 right-0 top-3 flex justify-center" aria-live="polite">
                <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
                  No QR code found — try adjusting the camera
                </span>
              </div>
            ) : null}
            {/* Controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/60 to-transparent p-4">
              {cameras.length > 1 ? (
                <div className="flex items-center gap-2">
                  <SwitchCamera className="h-4 w-4 text-white/80" aria-hidden />
                  <select
                    value={activeCameraId ?? ""}
                    onChange={(event) => handleCameraChange(event.target.value)}
                    className="rounded-md bg-black/50 px-2 py-1.5 text-sm text-white backdrop-blur-sm"
                    aria-label="Switch camera"
                  >
                    {cameras.map((camera) => (
                      <option key={camera.id} value={camera.id} className="bg-gray-900 text-white">
                        {camera.label || `Camera ${camera.id.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <Button type="button" variant="danger" onClick={handleStopScan} className="min-h-9 px-3 py-1.5 text-xs">
                <X className="h-3.5 w-3.5" aria-hidden />
                Stop
              </Button>
            </div>
          </div>
        ) : (
          /* Error states */
          <div className="space-y-3 px-5 py-6">
            <StatusMessage
              type={state === "insecure-context" ? "warning" : "error"}
              title={
                state === "no-camera" ? "No camera detected"
                : state === "permission-denied" ? "Camera permission denied"
                : state === "insecure-context" ? "Insecure context"
                : "Camera error"
              }
              description={errorMessage}
              action={
                <Button type="button" variant="secondary" onClick={handleReset} className="mt-2">
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Try again
                </Button>
              }
            />
          </div>
        )}
      </Card>

      {/* Camera selection (when idle or stopped with known cameras) */}
      {(state === "idle" || state === "stopped") && cameras.length > 1 ? (
        <label className="flex items-center gap-2 text-xs text-[#68758a]">
          <SwitchCamera className="h-3.5 w-3.5" aria-hidden />
          <span>Camera:</span>
          <select
            value={activeCameraId ?? ""}
            onChange={(event) => setActiveCameraId(event.target.value)}
            className="rounded border border-[#c7d6e8] bg-white/70 px-2 py-1 text-xs text-[#172033]"
            aria-label="Preferred camera"
          >
            <option value="" className="text-[#8a98aa]">Default (rear)</option>
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {/* Paste fallback */}
      <Card>
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-[#29364d]">
            <ClipboardPaste className="h-4 w-4" aria-hidden />
            Or paste a payment URI
          </span>
          <div className="flex gap-2">
            <Input
              value={pasteValue}
              onChange={(event) => setPasteValue(event.target.value)}
              placeholder="web+stellar:pay?destination=G…"
              className="flex-1"
              aria-label="Paste payment URI"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handlePasteSubmit}
              disabled={!pasteValue.trim()}
              aria-label="Parse pasted URI"
            >
              <ClipboardPaste className="h-4 w-4" aria-hidden />
              Parse
            </Button>
          </div>
        </label>
      </Card>
    </div>
  );
}
