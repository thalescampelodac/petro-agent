import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateReport } from './report';

const originalEnv = process.env;

describe('generateReport', () => {
  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('falls back when no AI key present', async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const res = await generateReport({ text: 'Company reported net income of R$ 1.000.000 and revenue R$ 10.000.000.' });
    expect(res.engine).toBe('fallback');
    expect(res.result.summary).toBeTruthy();
  });

  it('uses Gemini REST generateContent with configurable API version', async () => {
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: 'gemini-key',
      GEMINI_API_VERSION: 'v1beta',
      GEMINI_MODEL: 'gemini-2.5-flash',
      OPENAI_API_KEY: '',
    };
    const fetch = vi.fn(async () => ({
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    highlights: ['Ponto observado'],
                    summary: 'Resumo Gemini',
                  }),
                },
              ],
            },
          },
        ],
      }),
      ok: true,
    }));
    vi.stubGlobal('fetch', fetch);

    const res = await generateReport({ text: 'Petrobras publicou comunicado.' });

    expect(res).toEqual({
      engine: 'ai',
      result: {
        highlights: ['Ponto observado'],
        summary: 'Resumo Gemini',
      },
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': 'gemini-key',
        },
        method: 'POST',
      }),
    );
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body).toMatchObject({
      contents: [
        {
          parts: [{ text: expect.stringContaining('Petrobras publicou comunicado.') }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    });
  });

  it('parses Gemini JSON wrapped in markdown fences', async () => {
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: 'gemini-key',
      GEMINI_API_VERSION: 'v1beta',
      GEMINI_MODEL: 'gemini-2.5-flash',
      OPENAI_API_KEY: '',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '```json\\n{\"summary\":\"Resumo em português\",\"highlights\":[\"Ponto observado\"],\"key_facts\":[],\"sources\":[]}\\n```',
                  },
                ],
              },
            },
          ],
        }),
        ok: true,
      })),
    );

    const res = await generateReport({ text: 'Petrobras publicou comunicado.' });

    expect(res).toEqual({
      engine: 'ai',
      result: {
        highlights: ['Ponto observado'],
        key_facts: [],
        sources: [],
        summary: 'Resumo em português',
      },
    });
  });
});
