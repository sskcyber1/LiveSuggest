import { Suggestion } from '../types';

export const generateSuggestions = async (context: string, apiKey: string): Promise<Suggestion[]> => {
  if (!apiKey || !context.trim()) return [];

  const prompt = `
You are an AI assistant listening to a live conversation transcript.
Based on the following recent conversation, provide exactly 3 useful live suggestions.
Vary the suggestions based on the context. Suggestions can be:
- "question": A relevant follow-up question to keep the conversation going.
- "answer": A factual answer or resolution to a question raised in the transcript.
- "info": Useful clarifying context or facts about a mentioned topic.

Respond ONLY with a valid JSON document in the following format, no markdown wrapping, no explanation:
{
  "suggestions": [
    {
      "title": "Short generic title (2-4 words)",
      "preview": "A one sentence preview of the suggestion",
      "detail": "A detailed 2-3 sentence elaboration or answer that the user can read or send to chat.",
      "type": "question" // or "answer" or "info"
    }
  ]
}

Recent Transcript:
"""
${context}
"""
`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b', // Restoring the user's requested model
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
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
