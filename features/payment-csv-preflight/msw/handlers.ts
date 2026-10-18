/**
 * Offline tool — there is nothing to mock.
 *
 * The file is read with browser APIs and every check is local, so a request
 * leaving this slice would be a bug rather than something to intercept.
 */
export const handlers = [] as const;
