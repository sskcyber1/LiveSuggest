import React, { useState, FormEvent } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  initialSettings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ initialSettings, onClose, onSave }) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'api' | 'prompts' | 'context'>('api');

  // Handle local state updates
  const handleChange = (field: keyof AppSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto pt-10 pb-10">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[650px] flex flex-col p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 shrink-0">
          <SettingsIcon className="text-blue-600" /> Options & Tweaks
        </h2>

        {/* Custom Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6 shrink-0">
          <button 
            type="button"
            className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'api' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('api')}
          >
            API Key
          </button>
          <button 
            type="button"
            className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'prompts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('prompts')}
          >
            System Prompts
          </button>
          <button 
            type="button"
            className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'context' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('context')}
          >
            Context & Rules
          </button>
        </div>

        <form className="flex-1 flex flex-col overflow-hidden" onSubmit={handleSubmit}>
          <div className="flex-1 overflow-y-auto pr-2 pb-4">
            {activeTab === 'api' && (
              <div className="max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Groq API Key</label>
                  <input 
                    type="password" 
                    required
                    value={settings.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="gsk_..."
                  />
                  <p className="text-xs text-gray-500 mt-2">Required to generate transcripts, chat responses, and live suggestions.</p>
                </div>
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <div className="flex flex-col h-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Live Suggestion Prompt</label>
                  <textarea 
                    value={settings.liveSuggestionPrompt || ''}
                    onChange={(e) => handleChange('liveSuggestionPrompt', e.target.value)}
                    className="flex-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none min-h-[300px]"
                  />
                </div>
                
                <div className="flex flex-col h-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Standard Chat Prompt</label>
                  <textarea 
                    value={settings.chatPrompt || ''}
                    onChange={(e) => handleChange('chatPrompt', e.target.value)}
                    className="flex-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none min-h-[300px]"
                  />
                </div>

                <div className="flex flex-col h-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">On-click Prompt</label>
                  <textarea 
                    value={settings.expandAnswerPrompt || ''}
                    onChange={(e) => handleChange('expandAnswerPrompt', e.target.value)}
                    className="flex-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none min-h-[300px]"
                  />
                </div>
              </div>
            )}

            {activeTab === 'context' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Suggestions Context (chunks)</label>
                  <input 
                    type="number" 
                    min={1} max={50}
                    value={settings.liveContextWindow}
                    onChange={(e) => handleChange('liveContextWindow', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Expanded Chat Context</label>
                  <input 
                    type="number" 
                    min={1} max={100}
                    value={settings.expandContextWindow}
                    onChange={(e) => handleChange('expandContextWindow', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Temperature</label>
                  <input 
                    type="number" 
                    min={0} max={2} step={0.05}
                    value={settings.temperature}
                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Max Tokens</label>
                  <input 
                    type="number" 
                    min={100} max={8192} step={100}
                    value={settings.maxTokens}
                    onChange={(e) => handleChange('maxTokens', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
