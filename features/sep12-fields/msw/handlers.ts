/**
 * The SEP-12 field reference is a table compiled into the bundle and makes no
 * network request, so this slice registers no handlers. The file exists to
 * keep the layout uniform and to make the "nothing is transmitted" claim
 * explicit rather than implied by an absent file.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
