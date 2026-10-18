import { http, HttpResponse } from "msw";
import type { JsonBodyType } from "msw";
import {
  DOMAIN,
  FEDERATION_SERVER,
  TOML_URL,
  recordWithMemo,
  tomlWithFederation
} from "@/features/federation-resolver/fixtures/federationResolver.fixture";

/** Happy path: the domain declares a federation server that knows the name. */
export const handlers = [
  http.get(TOML_URL, () => HttpResponse.text(tomlWithFederation)),
  http.get(FEDERATION_SERVER, ({ request }) => {
    const q = new URL(request.url).searchParams.get("q");
    if (q === `alice*${DOMAIN}`) return HttpResponse.json(recordWithMemo);
    return new HttpResponse(null, { status: 404 });
  })
];

export function tomlHandler(body: string) {
  return http.get(TOML_URL, () => HttpResponse.text(body));
}

export const tomlMissingHandler = http.get(TOML_URL, () => new HttpResponse(null, { status: 404 }));

export function federationHandler(body: JsonBodyType, status = 200) {
  return http.get(FEDERATION_SERVER, () =>
    status === 200 ? HttpResponse.json(body) : new HttpResponse(null, { status })
  );
}
