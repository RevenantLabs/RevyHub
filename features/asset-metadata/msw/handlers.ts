import { http, HttpResponse } from "msw";
import { TOML_URL, tomlWithTwoCurrencies } from "@/features/asset-metadata/fixtures/assetMetadata.fixture";

export const handlers = [http.get(TOML_URL, () => HttpResponse.text(tomlWithTwoCurrencies))];

export function tomlHandler(body: string, init?: ResponseInit) {
  return http.get(TOML_URL, () => new HttpResponse(body, { status: 200, ...init }));
}

export const notFoundHandler = http.get(TOML_URL, () => new HttpResponse(null, { status: 404 }));

export const serverErrorHandler = http.get(TOML_URL, () => new HttpResponse(null, { status: 503 }));

/** Declares a body far larger than the cap without actually sending one. */
export const oversizedHeaderHandler = http.get(TOML_URL, () =>
  new HttpResponse("small body", { status: 200, headers: { "content-length": "999999" } })
);
