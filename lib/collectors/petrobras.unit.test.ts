import { describe, it, expect } from 'vitest';
import fetchPetrobrasRI from './petrobras';

describe('fetchPetrobrasRI', () => {
  it('returns a text and url (uses fallback when network fails)', async () => {
    const res = await fetchPetrobrasRI();
    expect(res.url).toContain('petrobras');
    expect(typeof res.text).toBe('string');
    expect(res.text.length).toBeGreaterThan(10);
  });
});
