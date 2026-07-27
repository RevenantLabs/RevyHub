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

  const stroops = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(stroops)) {
    return null;
  }

  return {
    stroops: String(stroops),
    xlm: (stroops / 10_000_000).toFixed(7)
  };
}
