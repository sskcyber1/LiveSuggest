import React, { useState, useCallback } from 'react';
import { Settings, Download, MessageSquare } from 'lucide-react';
import { useMicrophone } from './hooks/useMicrophone';
import { transcribeAudio } from './services/transcriptionService';
import { generateSuggestions } from './services/suggestionService';
import { TranscriptItem, Suggestion, ChatMessage } from './types';
import { TranscriptColumn } from './components/TranscriptColumn';
import { SuggestionsColumn } from './components/SuggestionsColumn';
import { ChatColumn } from './components/ChatColumn';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [showSettings, setShowSettings] = useState(!localStorage.getItem('apiKey'));
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '0', text: "Hello! I'm here to help. You can add suggestions here for more details or ask me anything directly.", sender: 'bot' }
  ]);

  const handleSendToChat = (text: string) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), text, sender: 'user' }]);
  };

  const generateNewSuggestions = useCallback(async (currentContext: string, currentKey: string) => {
    if (!currentKey || !currentContext.trim()) return;

    setIsGeneratingSuggestions(true);
    try {
      const newSuggestions = await generateSuggestions(currentContext, currentKey);
      if (newSuggestions.length > 0) {
        setSuggestions(prev => [...newSuggestions, ...prev]);
      }
    } catch (e) {
      console.error('Failed to generate suggestions', e);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, []);

  const manualRefreshSuggestions = useCallback(() => {
    const contextText = transcripts.slice(-5).map(t => t.text).join('\n');
    generateNewSuggestions(contextText, apiKey);
  }, [transcripts, apiKey, generateNewSuggestions]);

  // to display trancript as cards in the UI
  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    if (!apiKey) return;
    setIsTranscribing(true);

    try {
      const text = await transcribeAudio(audioBlob, apiKey);
      if (text) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setTranscripts(prev => {
          const newTranscripts = [...prev, { id: Date.now().toString(), text, timestamp }];
          const contextText = newTranscripts.slice(-5).map(t => t.text).join('\n');
          generateNewSuggestions(contextText, apiKey);
          return newTranscripts;
        });
      }
    } catch (e) {
      console.error('Failed to transcribe chunk:', e);
    } finally {
      setIsTranscribing(false);
    }
  }, [apiKey, generateNewSuggestions]);

  const { isRecording, recordingTime, toggleRecording } = useMicrophone({
    onChunkAvailable: processAudioChunk,
    chunkIntervalMs: 30000
  });

  const handleToggleRecording = () => {
    if (!apiKey) {
      alert('Please set your API Key in Settings first.');
      setShowSettings(true);
      return;
    }
    toggleRecording();
  };

  const handleSaveSettings = (newApiKey: string) => {
    localStorage.setItem('apiKey', newApiKey);
    setApiKey(newApiKey);
    setShowSettings(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800">
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Live Suggest
        </h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <TranscriptColumn 
          isRecording={isRecording}
          recordingTime={recordingTime}
          transcripts={transcripts}
          isTranscribing={isTranscribing}
          onToggleRecording={handleToggleRecording}
        />
        <SuggestionsColumn 
          suggestions={suggestions}
          isGeneratingSuggestions={isGeneratingSuggestions}
          transcriptsLength={transcripts.length}
          onRefresh={manualRefreshSuggestions}
          onSendToChat={handleSendToChat}
        />
        <ChatColumn 
          chatMessages={chatMessages}
          onSendToChat={handleSendToChat}
        />
      </main>

      {showSettings && (
        <SettingsModal 
          initialApiKey={apiKey}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
