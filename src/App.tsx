import { useState, useCallback, useRef, useEffect } from 'react';
import { Settings, Download, MessageSquare } from 'lucide-react';
import { useMicrophone } from './hooks/useMicrophone';
import { transcribeAudio } from './services/transcriptionService';
import { generateSuggestions } from './services/suggestionService';
import { sendChatMessage } from './services/chatService';
import { TranscriptItem, Suggestion, ChatMessage, AppSettings } from './types';
import { DEFAULT_SETTINGS } from './config';
import { TranscriptColumn } from './components/TranscriptColumn';
import { SuggestionsColumn } from './components/SuggestionsColumn';
import { ChatColumn } from './components/ChatColumn';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      const parsedUserApiKey = localStorage.getItem('apiKey');
      
      let initial = DEFAULT_SETTINGS;
      if (saved) {
        initial = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } else if (parsedUserApiKey) {
        initial = { ...DEFAULT_SETTINGS, apiKey: parsedUserApiKey };
      }
      return initial;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [showSettings, setShowSettings] = useState(!settings.apiKey);
  
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const transcriptsRef = useRef<TranscriptItem[]>(transcripts);
  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  const [isTranscribing, setIsTranscribing] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '0', text: "Hello! I'm here to help. You can add suggestions here for more details or ask me anything directly.", sender: 'bot' }
  ]);
  const [isChatting, setIsChatting] = useState(false);

  const handleSendToChat = async (text: string, isExpandAction: boolean = false) => {
    if (!text.trim()) return;

    if (!settings.apiKey) {
      alert('Please set your API Key in Settings first to use the chat.');
      setShowSettings(true);
      return;
    }
    
    const newUserMessage: ChatMessage = { id: Date.now().toString(), text, sender: 'user', isExpand: isExpandAction };
    
    // Use functional state update to confidently get the newest list while simultaneously adding the current message to API payload
    setChatMessages(prev => {
      const updatedMessages = [...prev, newUserMessage];
      
      // Async IIFE to fetch chatbot reply without blocking render
      (async () => {
        setIsChatting(true);
        try {
          const contextLength = isExpandAction ? settings.expandContextWindow : settings.liveContextWindow;
          const contextTranscriptText = transcriptsRef.current.slice(-contextLength).map(t => t.text).join('\n');
          const promptToUse = isExpandAction ? settings.expandAnswerPrompt : settings.chatPrompt;
          
          const botReply = await sendChatMessage(
            updatedMessages, 
            settings.apiKey, 
            promptToUse,
            settings.model,
            settings.temperature,
            settings.maxTokens,
            contextTranscriptText
          );
          setChatMessages(msgs => [...msgs, { id: Date.now().toString(), text: botReply, sender: 'bot' }]);
        } catch (e) {
          console.error("Chat sending failed", e);
        } finally {
          setIsChatting(false);
        }
      })();
      
      return updatedMessages;
    });
  };

  const generateNewSuggestions = useCallback(async (currentContext: string, currentKey: string, promptSetting: string) => {
    if (!currentKey || !currentContext.trim()) return;

    setIsGeneratingSuggestions(true);
    try {
      const newSuggestions = await generateSuggestions(
        currentContext, 
        currentKey, 
        promptSetting,
        settings.model,
        settings.temperature,
        settings.maxTokens
      );
      if (newSuggestions.length > 0) {
        setSuggestions(prev => [...newSuggestions, ...prev]);
      }
    } catch (e) {
      console.error('Failed to generate suggestions', e);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, []);

  // for manual refresh suggestions transcript
  const manualRefreshSuggestions = useCallback(() => {
    const contextText = transcripts.slice(-settings.liveContextWindow).map(t => t.text).join('\n');
    generateNewSuggestions(contextText, settings.apiKey, settings.liveSuggestionPrompt);
  }, [transcripts, settings, generateNewSuggestions]);

  // to display transcript as cards in the UI
  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    if (!settings.apiKey) return;
    setIsTranscribing(true);

    try {
      const text = await transcribeAudio(audioBlob, settings.apiKey);
      if (text) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const newTranscript = { id: Date.now().toString(), text, timestamp };
        
        setTranscripts(prev => [...prev, newTranscript]);

        // Access the most recently updated transcripts including the current text
        const newTranscriptsContext = [...transcriptsRef.current, newTranscript];
        const contextText = newTranscriptsContext.slice(-settings.liveContextWindow).map(t => t.text).join('\n');
        
        generateNewSuggestions(contextText, settings.apiKey, settings.liveSuggestionPrompt);
      }
    } catch (e) {
      console.error('Failed to transcribe chunk:', e);
    } finally {
      setIsTranscribing(false);
    }
  }, [settings, generateNewSuggestions]);

  const { isRecording, recordingTime, toggleRecording } = useMicrophone({
    onChunkAvailable: processAudioChunk,
    chunkIntervalMs: settings.chunkIntervalMs || 30000
  });

  const handleToggleRecording = () => {
    if (!settings.apiKey) {
      alert('Please set your API Key in Settings first.');
      setShowSettings(true);
      return;
    }
    toggleRecording();
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
    setShowSettings(false);
  };

  const handleExportSession = () => {
    const sessionData = {
      timestamp: new Date().toISOString(),
      transcripts,
      suggestions,
      chatMessages
    };

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `live-suggest-session-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800">
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Live Suggest
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportSession}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
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
          isChatting={isChatting}
          onSendToChat={handleSendToChat}
        />
      </main>

      {showSettings && (
        <SettingsModal 
          initialSettings={settings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
