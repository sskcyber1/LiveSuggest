import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { TranscriptItem } from '../types';

interface TranscriptColumnProps {
  isRecording: boolean;
  recordingTime: number;
  transcripts: TranscriptItem[];
  isTranscribing: boolean;
  onToggleRecording: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const TranscriptColumn: React.FC<TranscriptColumnProps> = ({
  isRecording,
  recordingTime,
  transcripts,
  isTranscribing,
  onToggleRecording
}) => {
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  return (
    <section className="w-1/3 flex flex-col border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">Transcript</h2>
        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600 font-mono text-sm font-medium animate-pulse">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              {formatTime(recordingTime)}
            </div>
          )}
          <button 
            onClick={onToggleRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
              isRecording 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRecording ? (
              <><MicOff className="w-4 h-4" /> Stop Recording</>
            ) : (
              <><Mic className="w-4 h-4" /> Start Recording</>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcripts.length === 0 ? (
          <div className="text-sm text-gray-500 text-center italic mt-4">
            Click 'Start Recording' to begin capturing transcripts...
          </div>
        ) : (
          transcripts.map((t) => (
            <div key={t.id} className="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-xs font-semibold text-blue-600">{t.timestamp}</span>
              <p className="text-sm text-gray-800 leading-relaxed">{t.text}</p>
            </div>
          ))
        )}
        {isTranscribing && (
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing audio...
          </div>
        )}
        <div ref={transcriptsEndRef} />
      </div>
    </section>
  );
};
