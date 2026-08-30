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
    const { messages, systemPrompt, model, temperature, maxTokens, contextTranscript } = await request.json();

    if (!Array.isArray(messages) || !systemPrompt) {
      return new Response(JSON.stringify({ error: 'Missing messages or systemPrompt' }), { status: 400 });
    }

    const systemMessage = {
      role: 'system',
      content: `${systemPrompt}\n    \nRecent Live Transcript Context:\n"""\n${contextTranscript || ''}\n"""`,
    };

    const groqRes = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-oss-120b',
        messages: [systemMessage, ...messages],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 1024,
      }),
    });

    const data = await groqRes.json();
    if (!groqRes.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || 'Chat failed' }), { status: groqRes.status });
    }

    return new Response(JSON.stringify({ content: data.choices?.[0]?.message?.content ?? 'No response generated.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Chat proxy error:', e);
    return new Response(JSON.stringify({ error: 'Chat failed' }), { status: 500 });
  }
}
