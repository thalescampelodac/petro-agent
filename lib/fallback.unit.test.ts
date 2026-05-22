import { describe, it, expect } from 'vitest';
import { generateFallbackSummary } from './fallback';

describe('generateFallbackSummary', () => {
  it('creates a basic summary and extracts numbers', () => {
    const text = `Petrobras announced net income of R$ 2.100.000.000 and revenue of R$ 50.000.000.000 in the quarter. The company also guided capex +10% next year.`;
    const out = generateFallbackSummary(text);
    expect(out.summary).toContain('Petrobras announced');
    expect(out.key_facts.length).toBeGreaterThan(0);
    expect(out.highlights.length).toBeGreaterThan(0);
  });
});
