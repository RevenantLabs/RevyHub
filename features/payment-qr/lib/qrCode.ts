import QRCode from "qrcode";

/**
 * Renders the URI as inline SVG rather than a canvas data URL.
 *
 * SVG stays sharp at any size, can be styled by the page, needs no canvas at
 * all (so it renders identically in tests and on the server), and keeps the
 * payload inspectable instead of hiding it inside a base64 blob.
 */
export async function renderQrSvg(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320
  });
}
