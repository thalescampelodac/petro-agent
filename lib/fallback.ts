export type FallbackSummary = {
  summary: string;
  highlights: string[];
  key_facts: { label: string; value: string }[];
  next_steps?: string;
  sources: string[];
};

function findNumbers(text: string) {
  const rx = /(?:R\$|BRL|USD|EUR)?\s?\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d+)?/g;
  const matches = text.match(rx) || [];
  return Array.from(new Set(matches)).slice(0, 10);
}

function splitSentences(text: string) {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

export function generateFallbackSummary(sourceText: string): FallbackSummary {
  const sentences = splitSentences(sourceText);
  const numbers = findNumbers(sourceText);

  const summary = sentences.slice(0, 2).join(' ' ) || (sourceText.slice(0, 160) + (sourceText.length>160? '...':''));

  const highlights = sentences
    .filter(s => /\b(revenue|net income|profit|loss|capex|dividend|guidance|increase|decrease|reported)\b/i.test(s) || /\d{2,4}/.test(s))
    .slice(0,6);

  const key_facts = numbers.map((n, i) => ({ label: `fact_${i+1}`, value: n }));

  const next_steps = highlights.length === 0 ? 'Revisar a fonte original para identificar sinais informativos verificáveis.' : undefined;

  const sources: string[] = [];

  return { summary, highlights, key_facts, next_steps, sources };
}

export default generateFallbackSummary;
