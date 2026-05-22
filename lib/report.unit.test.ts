import { describe, it, expect } from 'vitest';
import { generateReport } from './report';

describe('generateReport', () => {
  it('falls back when no AI key present', async () => {
    delete process.env.OPENAI_API_KEY;
    const res = await generateReport({ text: 'Company reported net income of R$ 1.000.000 and revenue R$ 10.000.000.' });
    expect(res.engine).toBe('fallback');
    expect(res.result.summary).toBeTruthy();
  });
});
