import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Share, HelpCircle, Info, Lightbulb, MessageCircle, ShieldAlert } from 'lucide-react';
import { Suggestion } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onSendToChat: (text: string, isExpandAction?: boolean) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onSendToChat }) => {
  const [expanded, setExpanded] = useState(false);

  const getIcon = () => {
    switch (suggestion.type) {
      case 'question': return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case 'talking_point': return <MessageCircle className="w-4 h-4 text-orange-500" />;
      case 'answer': return <Lightbulb className="w-4 h-4 text-green-500" />;
      case 'fact_check': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'clarifying_info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="text-left w-full p-3 flex items-start gap-3 hover:bg-gray-50 focus:outline-none"
      >
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 text-sm truncate">{suggestion.title}</div>
          <div className="text-gray-500 text-xs truncate mt-0.5">{suggestion.preview}</div>
        </div>
        <div className="text-gray-400 mt-0.5">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="p-3 pt-0 text-sm text-gray-700 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
          <p className="mt-2">{suggestion.detail}</p>
          <div className="flex justify-end">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSendToChat(`[Please expand on this suggestion]: ${suggestion.title} - ${suggestion.detail}`, true);
              }}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition"
            >
              <Share className="w-3.5 h-3.5" />
              Add to Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
