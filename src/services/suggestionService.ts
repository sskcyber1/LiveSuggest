import { Suggestion } from '../types';

export const generateSuggestions = async (
  context: string,
  apiKey: string,
  systemPrompt: string,
  model: string = 'openai/gpt-oss-120b',
  temperature: number = 0.85,
  maxTokens: number = 512
): Promise<Suggestion[]> => {
  if (!apiKey || !context.trim()) return [];

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Recent Transcript:\n"""\n${context}\n"""` }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      throw new Error(`Suggestion API failed: ${res.statusText}`);
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    
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
