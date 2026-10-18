/**
 * The memo encoder is fully offline: every byte is produced and read back in
 * the browser, so there is no request to mock. The array stays here because the
 * feature contract expects the file, and because an empty handler list is the
 * strongest statement that this tool talks to nothing.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
