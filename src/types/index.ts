export interface TranscriptItem {
  id: string;
  text: string;
  timestamp: string;
}

export interface Suggestion {
  id: string;
  title: string;
  preview: string;
  detail: string;
  type: 'question' | 'talking_point' | 'answer' | 'fact_check' | 'clarifying_info';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isExpand?: boolean;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  chunkIntervalMs: number;
  liveSuggestionPrompt: string;
  expandAnswerPrompt: string;
  chatPrompt: string;
  liveContextWindow: number;
  expandContextWindow: number;
}