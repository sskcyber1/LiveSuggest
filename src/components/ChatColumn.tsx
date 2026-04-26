import React, { useEffect, useRef, useState, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';

interface ChatColumnProps {
  chatMessages: ChatMessage[];
  isChatting: boolean;
  onSendToChat: (text: string) => void;
}

export const ChatColumn: React.FC<ChatColumnProps> = ({ chatMessages, isChatting, onSendToChat }) => {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendToChat(chatInput);
      setChatInput('');
    }
  };

  return (
    <section className="w-1/3 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-700">Chat Assistant</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-3 rounded-lg text-sm w-5/6 ${
              msg.sender === 'bot' 
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-900 self-start rounded-tl-none' 
                : 'bg-gray-100 text-gray-800 ml-auto self-end rounded-tr-none'
            } leading-relaxed break-words`}
          >
            <ReactMarkdown>
              {msg.text}
            </ReactMarkdown>
          </div>
        ))}
        {isChatting && (
          <div className="p-3 rounded-lg text-sm w-5/6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-900 self-start rounded-tl-none animate-pulse">
            Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatting}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim() || isChatting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
};
