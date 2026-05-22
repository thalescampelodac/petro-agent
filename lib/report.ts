import generateFallbackSummary from './fallback';
import { formatPromptWithContext, PROMPT_BASE } from './promptBase';
import fetchPetrobrasRI from './collectors/petrobras';

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

async function callAI(prompt: string) {
  // Prefer Gemini when configured, otherwise fall back to OpenAI if available
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (geminiKey) {
    const model = process.env.GEMINI_MODEL || 'gemini-1.0';
    const url = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generate?key=${geminiKey}`;
    const body = { instances: [{ content: prompt }], temperature: 0.2 } as any;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Gemini call failed: ${res.status}`);
    const data = await res.json();
    const content = data?.predictions?.[0]?.content || data?.candidates?.[0]?.content || data?.output?.[0]?.content;
    if (!content) throw new Error('Gemini returned no content');
    try {
      return JSON.parse(content);
    } catch {
      return { summary: String(content), highlights: [], key_facts: [], sources: [] };
    }
  }

  if (openaiKey) {
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
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
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

  throw new Error('No AI key configured');
}

export async function generateReport(input: ReportInput) {
  const { text, urls } = input;
  const urlText = urls && urls.length ? await fetchUrls(urls) : '';
  const sourceText = [text || '', urlText].filter(Boolean).join('\n\n');

  // Try AI when configured, otherwise fallback
  try {
    const prompt = formatPromptWithContext(sourceText || '');
    const aiResult = await callAI(prompt);
    return { engine: 'ai', result: aiResult };
  } catch (e) {
    const fallback = generateFallbackSummary(sourceText || '');
    return { engine: 'fallback', result: fallback };
  }
}

export default generateReport;
