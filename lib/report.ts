import generateFallbackSummary from './fallback';
import { formatPromptWithContext, PROMPT_BASE } from './promptBase';

type ReportInput = {
  text?: string;
  urls?: string[];
};

async function fetchUrls(urls: string[]) {
  const results: string[] = [];
  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'GET' });
      if (res.ok) {
        const t = await res.text();
        results.push(t.slice(0, 10000));
      }
    } catch (e) {
      // ignore fetch errors, continue
    }
  }
  return results.join('\n\n');
}

async function callOpenAI(prompt: string) {
  const key = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  if (!key) throw new Error('No AI key configured');

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: PROMPT_BASE },
      { role: 'user', content: prompt },
    ],
    max_tokens: 800,
  } as any;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`AI call failed: ${res.status}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI returned no content');
  try {
    return JSON.parse(content);
  } catch {
    return { summary: String(content), highlights: [], key_facts: [], sources: [] };
  }
}

export async function generateReport(input: ReportInput) {
  const { text, urls } = input;
  const urlText = urls && urls.length ? await fetchUrls(urls) : '';
  const sourceText = [text || '', urlText].filter(Boolean).join('\n\n');

  // Try AI when configured, otherwise fallback
  try {
    const prompt = formatPromptWithContext(sourceText || '');
    const aiResult = await callOpenAI(prompt);
    return { engine: 'ai', result: aiResult };
  } catch (e) {
    const fallback = generateFallbackSummary(sourceText || '');
    return { engine: 'fallback', result: fallback };
  }
}

export default generateReport;
