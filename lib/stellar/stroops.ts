export interface StroopAmount {
  stroops: string;
  xlm: string;
}

export function formatStroopAmount(value: string | number | null | undefined): StroopAmount | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  let normalized: string;

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) {
      return null;
    }
    normalized = String(value);
  } else {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
      return null;
    }
    normalized = trimmed.replace(/^0+(?=\d)/, "");
  }

  const padded = normalized.padStart(8, "0");

  return {
    stroops: normalized,
    xlm: `${padded.slice(0, -7)}.${padded.slice(-7)}`
  };
}
