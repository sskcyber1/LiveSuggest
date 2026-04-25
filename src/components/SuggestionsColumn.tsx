import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { Suggestion } from '../types';

interface SuggestionsColumnProps {
  suggestions: Suggestion[];
  isGeneratingSuggestions: boolean;
  transcriptsLength: number;
  onRefresh: () => void;
  onSendToChat: (text: string) => void;
}

export const SuggestionsColumn: React.FC<SuggestionsColumnProps> = ({
  suggestions,
  isGeneratingSuggestions,
  transcriptsLength,
  onRefresh,
  onSendToChat
}) => {
  return (
    <section className="w-1/3 flex flex-col border-r border-gray-200 bg-gray-50">
      <div className="p-4 flex justify-between items-center bg-white border-b border-gray-200">
        <h2 className="font-semibold text-gray-700">Live Suggestions</h2>
        <button 
          onClick={onRefresh}
          disabled={isGeneratingSuggestions || transcriptsLength === 0}
          className="p-1.5 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGeneratingSuggestions ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        {suggestions.length === 0 ? (
          <div className="text-sm text-gray-500 text-center italic mt-4">
            {isGeneratingSuggestions ? 'Generating initial suggestions...' : 'Suggestions will appear here based on the conversation...'}
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <SuggestionCard 
              key={suggestion.id} 
              suggestion={suggestion} 
              onSendToChat={onSendToChat} 
            />
          ))
        )}
        {isGeneratingSuggestions && suggestions.length > 0 && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>
    </section>
  );
};
