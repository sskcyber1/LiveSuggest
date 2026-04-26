import { useState, useRef, useEffect, useCallback } from 'react';

interface UseMicrophoneProps {
  onChunkAvailable: (blob: Blob) => void;
  chunkIntervalMs?: number;
}

export function useMicrophone({ onChunkAvailable, chunkIntervalMs = 30000 }: UseMicrophoneProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chunkIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (chunkIntervalRef.current) clearInterval(chunkIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        if (audioBlob.size > 0) {
          onChunkAvailable(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Chunk interval
      chunkIntervalRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          mediaRecorder.start();
        }
      }, chunkIntervalMs);

    } catch (e) {
      setIsRecording(false);
      console.error('Mic error:', e);
      throw new Error('Microphone access denied or unavailable.');
    }
  }, [onChunkAvailable, chunkIntervalMs]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (chunkIntervalRef.current) clearInterval(chunkIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    toggleRecording
  };
}
