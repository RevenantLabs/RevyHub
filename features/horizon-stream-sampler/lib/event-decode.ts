import { err, ok, type Result } from "@/core/result/result";
import type { HorizonStreamSamplerErrorCode, SampledEvent } from "@/features/horizon-stream-sampler/types";
export function decodeSseEvent(block: string): Result<SampledEvent | null, HorizonStreamSamplerErrorCode> {
  let event = "message"; let id: string | null = null; const data: string[] = [];
  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue;
    const colon = line.indexOf(":"); const field = colon < 0 ? line : line.slice(0, colon); const value = colon < 0 ? "" : line.slice(colon + 1).replace(/^ /, "");
    if (field === "event") event = value; else if (field === "id") id = value; else if (field === "data") data.push(value);
  }
  if (!data.length) return ok(null);
  try { return ok({ event, id, payload: JSON.parse(data.join("\n")) as unknown }); }
  catch { return err("malformed_event"); }
}
