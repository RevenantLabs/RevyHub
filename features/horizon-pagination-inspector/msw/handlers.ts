/**
 * The pagination inspector reads pasted text entirely in-process and makes no
 * network request, so this slice registers no handlers. The file exists to
 * keep the layout uniform and to make the "nothing is transmitted" claim
 * explicit rather than implied by the absence of a file.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
