/**
 * The source map decodes entirely in-process and makes no network request, so
 * this slice registers no handlers. The file exists to keep the layout uniform
 * and to make the "nothing is transmitted" claim explicit — including the JSON
 * export, which is produced locally and never uploaded.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
