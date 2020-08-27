import { Cache, QueryInput } from "@urql/exchange-graphcache";

// wrapper to cast types for urql cache handlers
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
