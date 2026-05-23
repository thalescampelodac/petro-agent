import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = process.env;

describe('reports service', () => {
  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('uses fallback when Supabase not configured', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '',
      NEXT_PUBLIC_SUPABASE_URL: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
    };

    const { saveReport, listReports } = await import('@/services/reports');

    await expect(saveReport('fallback', { foo: 'bar' })).resolves.toEqual({
      id: null,
      reason: 'missing_supabase_config',
    });
    await expect(listReports()).resolves.toEqual({
      reason: 'missing_supabase_config',
      reports: [],
    });
  });

  it('inserts and lists reports when supabase configured', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publish',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    };
    const single = vi.fn().mockResolvedValue({ data: { id: 123 }, error: null });
    const insertSelect = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select: insertSelect }));
    const range = vi.fn().mockResolvedValue({
      data: [
        {
          attention_points: [],
          created_at: new Date().toISOString(),
          id: 1,
          model_used: 'fallback',
          sentiment: null,
          source_count: 0,
          summary: 'Resumo',
          title: 'Relatório PetroAgent',
        },
      ],
      error: null,
    });
    const order = vi.fn(() => ({ range }));
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ insert, select }));
    const schema = vi.fn(() => ({ from }));
    const createClient = vi.fn(() => ({ schema }));

    vi.doMock('@supabase/supabase-js', () => ({ createClient }));

    const { saveReport, listReports } = await import('@/services/reports');

    await expect(
      saveReport('ai', {
        highlights: ['Ponto de atenção'],
        sources: ['https://example.com'],
        summary: 'Resumo gerado',
      }),
    ).resolves.toEqual({ id: 123 });
    await expect(listReports()).resolves.toHaveProperty('reports');

    expect(schema).toHaveBeenCalledWith('petroagent');
    expect(from).toHaveBeenCalledWith('agent_reports');
    expect(insert).toHaveBeenCalledWith({
      attention_points: ['Ponto de atenção'],
      model_used: 'ai',
      sentiment: null,
      source_count: 1,
      summary: 'Resumo gerado',
      title: 'Relatório PetroAgent',
    });
    expect(range).toHaveBeenCalledWith(0, 19);
  });
});
