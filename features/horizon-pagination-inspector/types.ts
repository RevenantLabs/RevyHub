export interface HorizonLink {
  href: string;
  templated?: boolean;
}

export interface HorizonLinks {
  self: HorizonLink;
  next?: HorizonLink;
  prev?: HorizonLink;
}

export interface HorizonPageInfo {
  records: number;
  nextCursor?: string;
  prevCursor?: string;
  selfHref: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type HorizonPaginationErrorCode =
  | "empty_input"
  | "invalid_response"
  | "invalid_cursor";
