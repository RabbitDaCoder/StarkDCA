// ─── Cursor-Based Pagination ─────────────────────────────────────────
// Prevents unbounded queries. Uses opaque cursors (base64-encoded IDs).

export interface PaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
  };
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePaginationParams(query: {
  cursor?: string;
  limit?: string;
}): PaginationParams {
  const limit = Math.min(
    Math.max(parseInt(query.limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  return {
    cursor: query.cursor ? decodeCursor(query.cursor) : undefined,
    limit,
  };
}

export function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64url');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64url').toString('utf-8');
}

/**
 * Build a Prisma-compatible cursor/take query.
 * Fetches limit + 1 to detect if there's a next page.
 */
export function buildPrismaPage(params: PaginationParams) {
  return {
    take: params.limit + 1,
    ...(params.cursor
      ? {
          cursor: { id: params.cursor },
          skip: 1, // skip the cursor item itself
        }
      : {}),
    orderBy: { createdAt: 'desc' as const },
  };
}

/**
 * Format raw Prisma results into a paginated response.
 */
export function formatPaginatedResult<T extends { id: string }>(
  items: T[],
  limit: number,
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const lastItem = data[data.length - 1];

  return {
    data,
    pagination: {
      nextCursor: hasMore && lastItem ? encodeCursor(lastItem.id) : null,
      hasMore,
      count: data.length,
    },
  };
}
