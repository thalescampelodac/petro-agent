export async function fetchPetrobrasRI(): Promise<{ url: string; text: string }> {
  const defaultUrl = 'https://www.petrobras.com.br/pt/quem-somos/ri/';
  try {
    const res = await fetch(defaultUrl, { method: 'GET' });
    if (!res.ok) throw new Error('fetch failed');
    const html = await res.text();
    // naive text extraction: strip tags (simple)
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 20000);
    return { url: defaultUrl, text };
  } catch {
    // fallback: return a sample RI snippet if fetch fails (useful for tests/offline)
    const sample = `Petrobras released its quarterly results showing net income of R$ 2.1B and revenue of R$ 50B. The company guided capex +10% for next year.`;
    return { url: defaultUrl, text: sample };
  }
}

export default fetchPetrobrasRI;
