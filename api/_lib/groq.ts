export const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

export function requireGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error('GROQ_API_KEY is not configured on the server');
  }
  return key;
}
