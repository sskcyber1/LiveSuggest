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
    const incomingForm = await request.formData();
    const file = incomingForm.get('file');
    if (!(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: 'Missing audio file' }), { status: 400 });
    }

    const groqForm = new FormData();
    groqForm.append('file', file, 'audio.webm');
    groqForm.append('model', 'whisper-large-v3');

    const groqRes = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: groqForm,
    });

    const data = await groqRes.json();
    if (!groqRes.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || 'Transcription failed' }), { status: groqRes.status });
    }

    return new Response(JSON.stringify({ text: data.text ?? '' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Transcription proxy error:', e);
    return new Response(JSON.stringify({ error: 'Transcription failed' }), { status: 500 });
  }
}
