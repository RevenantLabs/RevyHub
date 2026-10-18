import { http, HttpResponse } from "msw";
import { horizonUrl } from "@/core/horizon/client";
import { horizonHealthFixture } from "../fixtures/horizonHealth.fixture";
export const handlers = [http.get(horizonUrl("testnet", "/"), () => HttpResponse.json(horizonHealthFixture))];
