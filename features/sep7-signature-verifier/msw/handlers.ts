import { http, HttpResponse } from "msw";
import { TOML_URL, tomlWithSigningKey } from "@/features/sep7-signature-verifier/fixtures/sep7SignatureVerifier.fixture";

export const handlers = [http.get(TOML_URL, () => HttpResponse.text(tomlWithSigningKey))];
export function tomlHandler(body: string, status = 200) {
  return http.get(TOML_URL, () => status === 200 ? HttpResponse.text(body) : new HttpResponse(null, { status }));
}
