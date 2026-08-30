import { ChatMessage } from '../types';

export const sendChatMessage = async (
  messages: ChatMessage[],
  systemPrompt: string,
  model: string = 'openai/gpt-oss-120b',
  temperature: number = 0.7,
  maxTokens: number = 1024,
  contextTranscript: string = ''
): Promise<string> => {
  const apiMessages = messages.map(m => ({
    role: m.sender === 'bot' ? 'assistant' : 'user',
    content: m.text
  }));

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages, systemPrompt, model, temperature, maxTokens, contextTranscript }),
    });

    if (!res.ok) {
      throw new Error(`Chat API failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.content || 'No response generated.';
  } catch (e) {
    console.error('Chat error:', e);
    return "Sorry, I couldn't generate a response at this time.";
  }
};
