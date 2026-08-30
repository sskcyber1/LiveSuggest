import { GROQ_API_BASE, requireGroqApiKey } from './_lib/groq';

export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let apiKey: string;
  try {
    apiKey = requireGroqApiKey();
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }

  try {
    const { context, systemPrompt, model, temperature, maxTokens } = await request.json();

    if (!context || !systemPrompt) {
      return new Response(JSON.stringify({ error: 'Missing context or systemPrompt' }), { status: 400 });
    }

    const groqRes = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Recent Transcript:\n"""\n${context}\n"""` },
        ],
        temperature: temperature ?? 0.85,
        max_tokens: maxTokens ?? 512,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await groqRes.json();
    if (!groqRes.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || 'Suggestion generation failed' }), { status: groqRes.status });
    }

    return new Response(JSON.stringify({ content: data.choices?.[0]?.message?.content ?? '' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Suggestion proxy error:', e);
    return new Response(JSON.stringify({ error: 'Suggestion generation failed' }), { status: 500 });
  }
}
