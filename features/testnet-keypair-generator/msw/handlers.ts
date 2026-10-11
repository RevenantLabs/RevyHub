import { http, HttpResponse } from "msw";

export const handlers: ReturnType<typeof http.get>[] = [];
