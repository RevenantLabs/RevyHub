import { err, ok, type Result } from "@/core/result/result";
import type {
  HorizonPaginationInspectorErrorCode,
  HorizonPaginationInspectorInput,
  RawHorizonPaginationInput
} from "@/features/horizon-pagination-inspector/types";

export const MAX_COLLECTION_LENGTH = 1_048_576;
export const MAX_ORIGIN_LENGTH = 1_024;

const SECRET_SEED = /S[A-Z2-7]{55}/;

/**
 * Validates the raw collection payload and optional origin string.
 *
 * Rejects empty payloads, oversize strings, secret keys, and malformed origins.
 */
export function parseHorizonPaginationInput({
  collection: rawCollection,
  expectedOrigin: rawExpectedOrigin
}: RawHorizonPaginationInput): Result<
  HorizonPaginationInspectorInput,
  HorizonPaginationInspectorErrorCode
> {
  const collection = rawCollection.trim();
  const originInput = rawExpectedOrigin ? rawExpectedOrigin.trim() : "";

  if (!collection) {
    return err("empty_input");
  }

  if (collection.length > MAX_COLLECTION_LENGTH) {
    return err("input_too_large");
  }

  if (originInput.length > MAX_ORIGIN_LENGTH) {
    return err("input_too_large");
  }

  if (SECRET_SEED.test(collection) || (originInput && SECRET_SEED.test(originInput))) {
    return err("invalid_input");
  }

  let normalizedOrigin: string | null = null;
  if (originInput) {
    try {
      const parsedUrl = new URL(originInput);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return err("invalid_input");
      }
      normalizedOrigin = parsedUrl.origin;
    } catch {
      return err("invalid_input");
    }
  }

  return ok({
    collectionText: collection,
    expectedOrigin: normalizedOrigin
  });
}
