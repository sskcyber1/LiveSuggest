import { ChatMessage } from '../types';

export const sendChatMessage = async (
  messages: ChatMessage[],
  apiKey: string,
  systemPrompt: string,
  model: string = 'openai/gpt-oss-120b',
  temperature: number = 0.7,
  maxTokens: number = 1024,
  contextTranscript: string = ''
): Promise<string> => {
  if (!apiKey) throw new Error("No API key provided");

  const systemMessage = {
    role: 'system',
    content: `${systemPrompt}
    
Recent Live Transcript Context:
"""
${contextTranscript}
"""`
  };

  const apiMessages = [
    systemMessage,
    ...messages.map(m => ({
      role: m.sender === 'bot' ? 'assistant' : 'user',
      content: m.text
    }))
  ];

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        temperature: temperature,
        max_tokens: maxTokens,
      })
    });

    if (!res.ok) {
      throw new Error(`Chat API failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices[0].message.content || 'No response generated.';
  } catch (e) {
    console.error('Chat error:', e);
    return "Sorry, I couldn't generate a response at this time.";
  }
};
