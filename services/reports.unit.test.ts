import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = process.env;

describe('reports service', () => {
  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('uses fallback when Supabase not configured', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '', NEXT_PUBLIC_SUPABASE_URL: '' };

    const { saveReport, listReports } = await import('@/services/reports');

    await expect(saveReport('fallback', { foo: 'bar' })).resolves.toEqual({ id: null, reason: 'missing_supabase_config' });
    await expect(listReports()).resolves.toEqual({ reports: [], reason: 'missing_supabase_config' });
  });

  it('inserts and lists reports when supabase configured', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publish', NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' };
    const insert = vi.fn().mockResolvedValue({ data: { id: 123 }, error: null });
    const select = vi.fn().mockResolvedValue({ data: [{ id: 1, engine: 'f', payload: {}, created_at: new Date().toISOString() }], error: null });
    const from = vi.fn(() => ({ insert, select, order: () => ({ limit: () => ({ offset: () => ({}) }) }) }));
    const schema = vi.fn(() => ({ from }));
    const createClient = vi.fn(() => ({ schema }));

    vi.doMock('@supabase/supabase-js', () => ({ createClient }));

    const { saveReport, listReports } = await import('@/services/reports');

    await expect(saveReport('ai', { a: 1 })).resolves.toEqual({ id: 123 });
    await expect(listReports()).resolves.toHaveProperty('reports');

    expect(schema).toHaveBeenCalledWith('petroagent');
    expect(from).toHaveBeenCalledWith('reports');
  });
});
