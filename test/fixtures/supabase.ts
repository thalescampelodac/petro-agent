import { vi } from "vitest";

export type SupabaseFixtureResult = {
  count?: number | null;
  data?: unknown;
  error?: unknown;
};

type FixtureMap = Record<string, SupabaseFixtureResult | SupabaseFixtureResult[]>;

function takeResult(results: FixtureMap, table: string): SupabaseFixtureResult {
  const value = results[table];

  if (Array.isArray(value)) {
    return value.shift() ?? { data: null, error: null };
  }

  return value ?? { data: null, error: null };
}

export function createSupabaseFixtureClient(results: FixtureMap) {
  const calls: Array<{ args: unknown[]; method: string; table: string }> = [];

  function createQuery(table: string) {
    const query = {
      delete: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "delete", table });
        return query;
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "eq", table });
        return query;
      }),
      gte: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "gte", table });
        return query;
      }),
      insert: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "insert", table });
        return query;
      }),
      limit: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "limit", table });
        return query;
      }),
      lte: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "lte", table });
        return query;
      }),
      maybeSingle: vi.fn(() => Promise.resolve(takeResult(results, table))),
      or: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "or", table });
        return query;
      }),
      order: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "order", table });
        return query;
      }),
      range: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "range", table });
        return Promise.resolve(takeResult(results, table));
      }),
      select: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "select", table });
        return query;
      }),
      single: vi.fn(() => Promise.resolve(takeResult(results, table))),
      then: (
        onFulfilled?: (value: SupabaseFixtureResult) => unknown,
        onRejected?: (reason: unknown) => unknown,
      ) => Promise.resolve(takeResult(results, table)).then(onFulfilled, onRejected),
      update: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "update", table });
        return query;
      }),
      upsert: vi.fn((...args: unknown[]) => {
        calls.push({ args, method: "upsert", table });
        return query;
      }),
    };

    return query;
  }

  const from = vi.fn((table: string) => createQuery(table));
  const schema = vi.fn(() => ({ from }));
  const client = { schema };

  return {
    calls,
    client,
    from,
    schema,
  };
}
