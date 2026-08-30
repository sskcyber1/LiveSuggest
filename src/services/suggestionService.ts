import { Suggestion } from '../types';

export const generateSuggestions = async (
  context: string,
  systemPrompt: string,
  model: string = 'openai/gpt-oss-120b',
  temperature: number = 0.85,
  maxTokens: number = 512
): Promise<Suggestion[]> => {
  if (!context.trim()) return [];

  try {
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, systemPrompt, model, temperature, maxTokens }),
    });

    if (!res.ok) {
      throw new Error(`Suggestion API failed: ${res.statusText}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.content);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return parsed.suggestions.map((s: any, i: number) => ({
      id: `${Date.now()}-${i}`,
      title: s.title,
      preview: s.preview,
      detail: s.detail,
      type: s.type,
      timestamp
    }));
  } catch (e) {
    console.error('Suggestion generation error:', e);
    return [];
  }
};
