/**
 * A tiny, dependency-free Result type shared by every feature slice.
 *
 * Feature logic must never throw for *expected* failures. It returns a
 * discriminated result so the UI can map each error code to precise recovery
 * guidance without parsing English strings.
 */

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<C extends string, D = undefined> {
  readonly ok: false;
  readonly code: C;
  readonly detail?: D;
}

export type Result<T, C extends string = string, D = unknown> = Ok<T> | Err<C, D>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<C extends string, D = undefined>(code: C, detail?: D): Err<C, D> {
  return detail === undefined ? { ok: false, code } : { ok: false, code, detail };
}

export function isOk<T, C extends string, D>(result: Result<T, C, D>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, C extends string, D>(result: Result<T, C, D>): result is Err<C, D> {
  return !result.ok;
}

export function unwrapOr<T, C extends string, D>(result: Result<T, C, D>, fallback: T): T {
  return result.ok ? result.value : fallback;
}

export function mapOk<T, U, C extends string, D>(
  result: Result<T, C, D>,
  transform: (value: T) => U
): Result<U, C, D> {
  return result.ok ? ok(transform(result.value)) : result;
}
