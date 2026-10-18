import type {RequestHandler} from "msw";
/** Fully offline: any unexpected request fails the test harness. */
export const handlers:RequestHandler[]=[];
