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
  type: 'question' | 'answer' | 'info';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}