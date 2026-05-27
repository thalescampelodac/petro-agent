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
    } catch {
      // ignore fetch errors, continue
    }
  }
  return results.join('\n\n');
}

type GeminiRequestBody = {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig: {
    temperature: number;
  };
};

type OpenAIRequestBody = {
  max_tokens: number;
  messages: Array<{ content: string; role: 'system' | 'user' }>;
  model: string;
};

function parseAIContent(content: string) {
  const normalized = content
    .trim()
    .replace(/^```(?:json)?[\s\\n]*/i, '')
    .replace(/[\s\\n]*```$/i, '')
    .trim();

  try {
    return JSON.parse(normalized);
  } catch {
    return {
      highlights: [],
      key_facts: [],
      sources: [],
      summary: content,
    };
  }
}

async function callAI(prompt: string) {
  // Prefer Gemini when configured, otherwise fall back to OpenAI if available
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (geminiKey) {
    const apiVersion = process.env.GEMINI_API_VERSION?.trim() || 'v1beta';
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`;
    const body: GeminiRequestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini call failed: ${res.status}`);
    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join('\n');
    if (!content) throw new Error('Gemini returned no content');
    return parseAIContent(content);
  }

  if (openaiKey) {
    const body: OpenAIRequestBody = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: PROMPT_BASE },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`AI call failed: ${res.status}`);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI returned no content');
    return parseAIContent(content);
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
  } catch {
    const fallback = generateFallbackSummary(sourceText || '');
    return { engine: 'fallback', result: fallback };
  }
}

export default generateReport;
